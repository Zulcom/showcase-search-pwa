import fs from "node:fs/promises";
import path from "node:path";

const GITHUB_OPENAPI_URL =
  "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json";

const NEEDED_SCHEMAS = ["simple-user", "repository", "nullable-repository"];

async function generateTypes() {
  console.log("Fetching GitHub OpenAPI schema...");

  const response = await fetch(GITHUB_OPENAPI_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const spec = await response.json();
  const schemas = spec.components?.schemas || {};

  const collectedSchemas = new Set<string>();

  function collectDeps(schemaName: string) {
    if (collectedSchemas.has(schemaName)) return;
    const schema = schemas[schemaName];
    if (!schema) return;

    collectedSchemas.add(schemaName);

    const refs = JSON.stringify(schema).matchAll(/"#\/components\/schemas\/([^"]+)"/g);
    for (const match of refs) {
      collectDeps(match[1]);
    }
  }

  for (const name of NEEDED_SCHEMAS) {
    collectDeps(name);
  }

  console.log(
    `Generating types for ${collectedSchemas.size} schemas (filtered from ${Object.keys(schemas).length})`
  );

  let output = ``;

  function schemaToTS(schema: any, indent = ""): string {
    if (!schema) return "unknown";

    const nullable = schema.nullable ? " | null" : "";

    if (schema.$ref) {
      const refName = schema.$ref.replace("#/components/schemas/", "");
      return toTypeName(refName) + nullable;
    }

    if (schema.oneOf || schema.anyOf) {
      const variants = schema.oneOf || schema.anyOf;
      return variants.map((v: any) => schemaToTS(v, indent)).join(" | ") + nullable;
    }

    if (schema.allOf) {
      const base = schema.allOf.map((v: any) => schemaToTS(v, indent)).join(" & ");
      return nullable ? `(${base})${nullable}` : base;
    }

    if (schema.enum) {
      return schema.enum.map((v: any) => JSON.stringify(v)).join(" | ") + nullable;
    }

    if (schema.type === "array") {
      const itemType = schemaToTS(schema.items, indent);
      return `${itemType}[]` + nullable;
    }

    if (schema.type === "object" || schema.properties) {
      const props = schema.properties || {};
      const required = new Set(schema.required || []);
      const lines: string[] = [];

      for (const [key, val] of Object.entries(props)) {
        const opt = required.has(key) ? "" : "?";
        const propType = schemaToTS(val as any, indent + "  ");
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        lines.push(`${indent}  ${safeKey}${opt}: ${propType};`);
      }

      if (lines.length === 0) {
        const objType = schema.additionalProperties
          ? `Record<string, ${schemaToTS(schema.additionalProperties, indent)}>`
          : "Record<string, unknown>";
        return objType + nullable;
      }

      return `{\n${lines.join("\n")}\n${indent}}` + nullable;
    }

    if (schema.type === "string") return "string" + nullable;
    if (schema.type === "integer" || schema.type === "number") return "number" + nullable;
    if (schema.type === "boolean") return "boolean" + nullable;
    if (schema.type === "null") return "null";

    return "unknown" + nullable;
  }

  function toTypeName(schemaName: string): string {
    return schemaName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  const sortedSchemas = Array.from(collectedSchemas).sort();
  for (const name of sortedSchemas) {
    const schema = schemas[name];
    const typeName = toTypeName(name);
    const description = schema.description ? `/** ${schema.description} */\n` : "";
    const isNullable = schema.nullable;

    if ((schema.type === "object" || schema.properties) && !isNullable) {
      output += `${description}export interface ${typeName} ${schemaToTS({ ...schema, nullable: false })}\n\n`;
    } else if ((schema.type === "object" || schema.properties) && isNullable) {
      output += `${description}export type ${typeName} = ${schemaToTS({ ...schema, nullable: false })} | null;\n\n`;
    } else {
      output += `${description}export type ${typeName} = ${schemaToTS(schema)};\n\n`;
    }
  }

  const outputPath = path.join(process.cwd(), "src/types/github.generated.ts");
  await fs.writeFile(outputPath, output, "utf-8");

  const stats = await fs.stat(outputPath);
  console.log(`Generated ${outputPath} (${Math.round(stats.size / 1024)}KB)`);
}

generateTypes().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

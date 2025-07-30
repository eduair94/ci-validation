#!/usr/bin/env node
import { Command } from "commander";
import { normalizeCI, queryCIInfo, validateCI, validateCIAndQuery, validateCIFormat, VERSION } from "../lib/index";

const program = new Command();

program.name("ci-validate").description("Uruguayan CI (Cédula de Identidad) validation tool").version(VERSION);

program
  .command("validate")
  .alias("v")
  .description("Validate a Uruguayan CI number")
  .argument("<ci>", "CI number to validate")
  .option("-q, --query", "Query information from official service")
  .option("-f, --format-only", "Only validate format (no check digit)")
  .option("-n, --normalize", "Show normalized CI")
  .option("-j, --json", "Output as JSON")
  .action(async (ci: string, options: any) => {
    try {
      if (options.formatOnly) {
        const isValidFormat = validateCIFormat(ci);
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                ci,
                validFormat: isValidFormat,
                normalized: normalizeCI(ci),
              },
              null,
              2
            )
          );
        } else {
          console.log(`CI: ${ci}`);
          console.log(`Format: ${isValidFormat ? "✓ Valid" : "✗ Invalid"}`);
          if (options.normalize) {
            console.log(`Normalized: ${normalizeCI(ci)}`);
          }
        }
        return;
      }

      if (options.query) {
        const result = await validateCIAndQuery(ci);
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          if (result.success && result.data) {
            console.log(`CI: ${result.data.ci}`);
            console.log(`Valid: ✓ Yes`);
            console.log(`Normalized: ${result.data.normalizedCi}`);
            if (result.data.info) {
              console.log("\nAdditional Information:");
              if (typeof result.data.info === "object" && result.data.info.persona) {
                const persona = result.data.info.persona;
                console.log(`Name: ${persona.nombre} ${persona.apellido}`);
                console.log(`Status: ${result.data.info.status === 0 ? "Active" : "Unknown"}`);
              } else {
                console.log(result.data.info);
              }
            }
          } else {
            console.log(`CI: ${ci}`);
            console.log(`Valid: ✗ No`);
            console.log(`Error: ${result.error}`);
          }
        }
      } else {
        const isValid = validateCI(ci);
        const normalized = normalizeCI(ci);

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                ci,
                valid: isValid,
                normalized: normalized,
              },
              null,
              2
            )
          );
        } else {
          console.log(`CI: ${ci}`);
          console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);
          if (options.normalize) {
            console.log(`Normalized: ${normalized}`);
          }
        }
      }
    } catch (error) {
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2
          )
        );
      } else {
        console.error("Error:", error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });

program
  .command("normalize")
  .alias("n")
  .description("Normalize a CI number (add leading zeros)")
  .argument("<ci>", "CI number to normalize")
  .option("-j, --json", "Output as JSON")
  .action((ci: string, options: any) => {
    const normalized = normalizeCI(ci);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            original: ci,
            normalized: normalized,
          },
          null,
          2
        )
      );
    } else {
      console.log(normalized);
    }
  });

program
  .command("query")
  .alias("q")
  .description("Query CI information from official service")
  .argument("<ci>", "CI number to query")
  .option("-j, --json", "Output as JSON")
  .action(async (ci: string, options: any) => {
    try {
      const result = await queryCIInfo(ci);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.success) {
          console.log("Query successful:");
          if (typeof result.data === "object" && result.data.persona) {
            const persona = result.data.persona;
            console.log(`Name: ${persona.nombre} ${persona.apellido}`);
            console.log(`Status: ${result.data.status === 0 ? "Active" : "Unknown"}`);
          } else {
            console.log(result.data);
          }
        } else {
          console.log("Query failed:", result.error);
        }
      }
    } catch (error) {
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2
          )
        );
      } else {
        console.error("Error:", error instanceof Error ? error.message : error);
      }
      process.exit(1);
    }
  });

program
  .command("batch")
  .alias("b")
  .description("Validate multiple CI numbers from stdin or arguments")
  .argument("[cis...]", "CI numbers to validate (if not provided, reads from stdin)")
  .option("-q, --query", "Query information from official service")
  .option("-j, --json", "Output as JSON")
  .action(async (cis: string[], options) => {
    try {
      let ciNumbers: string[] = cis;

      // If no arguments provided, read from stdin
      if (ciNumbers.length === 0) {
        const stdin = process.stdin;
        stdin.setEncoding("utf8");

        let input = "";
        for await (const chunk of stdin) {
          input += chunk;
        }

        ciNumbers = input
          .trim()
          .split(/\s+/)
          .filter((ci) => ci.length > 0);
      }

      const results = [];

      for (const ci of ciNumbers) {
        try {
          if (options.query) {
            const result = await validateCIAndQuery(ci);
            results.push(result);
          } else {
            const isValid = validateCI(ci);
            results.push({
              ci,
              valid: isValid,
              normalized: normalizeCI(ci),
            });
          }
        } catch (error) {
          results.push({
            ci,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        results.forEach((result, index) => {
          if (index > 0) console.log("---");

          if ("error" in result) {
            console.log(`Error: ${result.error}`);
          } else if ("success" in result) {
            console.log(`CI: ${result.data?.ci}`);
            console.log(`Valid: ${result.success && result.data?.isValid ? "✓ Yes" : "✗ No"}`);
            if (result.data?.info && typeof result.data.info === "object" && result.data.info.persona) {
              const persona = result.data.info.persona;
              console.log(`Name: ${persona.nombre} ${persona.apellido}`);
            }
          } else {
            console.log(`CI: ${result.ci}`);
            console.log(`Valid: ${result.valid ? "✓ Yes" : "✗ No"}`);
          }
        });
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Default command (when just running `ci-validate <ci>`)
program.argument("[ci]", "CI number to validate").action(async (ci?: string) => {
  if (!ci) {
    program.help();
    return;
  }

  const isValid = validateCI(ci);
  console.log(`CI: ${ci}`);
  console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);
  console.log(`Normalized: ${normalizeCI(ci)}`);
});

export { program };

// If this file is run directly (not imported)
if (require.main === module) {
  program.parse();
}

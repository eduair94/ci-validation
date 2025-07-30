#!/usr/bin/env node
import { Command } from "commander";
import { normalizeCI, validateCI } from "../lib/index";
import { LoteriaUyCiService } from "../services/CiService";
import { UruguayanCiValidator } from "../validators/CiValidator";

const program = new Command();
const validator = new UruguayanCiValidator();
const service = new LoteriaUyCiService();

program.name("ci-validate").description("Uruguayan CI (Cédula de Identidad) validation tool").version("1.0.0");

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
      const normalizedCi = normalizeCI(ci);

      if (options.formatOnly) {
        const hasValidFormat = /^[0-9]{7,8}$/.test(normalizedCi);
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                ci,
                validFormat: hasValidFormat,
                normalized: normalizedCi,
              },
              null,
              2
            )
          );
        } else {
          console.log(`CI: ${ci}`);
          console.log(`Format: ${hasValidFormat ? "✓ Valid" : "✗ Invalid"}`);
          if (options.normalize) {
            console.log(`Normalized: ${normalizedCi}`);
          }
        }
        return;
      }

      const isValid = validateCI(ci);

      if (options.query && isValid) {
        try {
          const queryResult = await service.queryCiInfo(normalizedCi);
          if (options.json) {
            console.log(
              JSON.stringify(
                {
                  ci,
                  isValid,
                  normalized: normalizedCi,
                  queryResult,
                },
                null,
                2
              )
            );
          } else {
            console.log(`CI: ${ci}`);
            console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);
            console.log(`Normalized: ${normalizedCi}`);
            if (queryResult.success && queryResult.data) {
              console.log("\nAdditional Information:");
              console.log(queryResult.data);
            } else if (queryResult.error) {
              console.log(`Query Error: ${queryResult.error}`);
            }
          }
        } catch (error) {
          if (options.json) {
            console.log(
              JSON.stringify(
                {
                  ci,
                  isValid,
                  normalized: normalizedCi,
                  queryError: error instanceof Error ? error.message : "Unknown error",
                },
                null,
                2
              )
            );
          } else {
            console.log(`CI: ${ci}`);
            console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);
            console.log(`Normalized: ${normalizedCi}`);
            console.log(`Query Error: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        }
      } else {
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                ci,
                isValid,
                normalized: normalizedCi,
              },
              null,
              2
            )
          );
        } else {
          console.log(`CI: ${ci}`);
          console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);
          console.log(`Normalized: ${normalizedCi}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              error: errorMessage,
            },
            null,
            2
          )
        );
      } else {
        console.error(`Error: ${errorMessage}`);
      }
      process.exit(1);
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
      const normalizedCi = normalizeCI(ci);
      const isValid = validateCI(ci);

      if (!isValid) {
        const message = "CI is not valid, cannot query";
        if (options.json) {
          console.log(JSON.stringify({ error: message }, null, 2));
        } else {
          console.error(message);
        }
        process.exit(1);
      }

      const result = await service.queryCiInfo(normalizedCi);

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              ci,
              normalized: normalizedCi,
              result,
            },
            null,
            2
          )
        );
      } else {
        console.log(`CI: ${ci} (${normalizedCi})`);
        if (result.success && result.data) {
          console.log("Information:");
          console.log(result.data);
        } else if (result.error) {
          console.log(`Error: ${result.error}`);
        } else {
          console.log("No information available");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (options.json) {
        console.log(JSON.stringify({ error: errorMessage }, null, 2));
      } else {
        console.error(`Error: ${errorMessage}`);
      }
      process.exit(1);
    }
  });

program
  .command("normalize")
  .alias("n")
  .description("Normalize a CI number (add leading zeros, remove formatting)")
  .argument("<ci>", "CI number to normalize")
  .option("-j, --json", "Output as JSON")
  .action((ci: string, options: any) => {
    try {
      const normalized = normalizeCI(ci);
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              original: ci,
              normalized,
            },
            null,
            2
          )
        );
      } else {
        console.log(normalized);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (options.json) {
        console.log(JSON.stringify({ error: errorMessage }, null, 2));
      } else {
        console.error(`Error: ${errorMessage}`);
      }
      process.exit(1);
    }
  });

// Default action when no command is provided
program.argument("[ci]", "CI number to validate").action(async (ci?: string) => {
  if (!ci) {
    program.help();
    return;
  }

  try {
    const normalizedCi = normalizeCI(ci);
    const isValid = validateCI(ci);

    console.log(`CI: ${ci}`);
    console.log(`Normalized: ${normalizedCi}`);
    console.log(`Valid: ${isValid ? "✓ Yes" : "✗ No"}`);

    if (isValid) {
      console.log('\nTip: Use "ci-validate query <ci>" to get additional information');
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }
});

program.parse();

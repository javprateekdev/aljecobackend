import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from '../types';

export function validateEnvironmentVariables(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

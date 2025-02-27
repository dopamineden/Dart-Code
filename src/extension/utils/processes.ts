import { Logger, SpawnedProcess } from "../../shared/interfaces";
import { runProcess, RunProcessResult, safeSpawn } from "../../shared/processes";

// Environment used when spawning Dart and Flutter processes.
let toolEnv: /* { [key: string]: string | undefined } */ any = {};
let globalFlutterArgs: string[] = [];

export function getToolEnv() {
	return toolEnv;
}

export function getGlobalFlutterArgs() {
	return globalFlutterArgs;
}

export function setupToolEnv(envOverrides?: any) {
	toolEnv = {};
	globalFlutterArgs = [];

	toolEnv.FLUTTER_HOST = "VSCode";
	toolEnv.PUB_ENVIRONMENT = (toolEnv.PUB_ENVIRONMENT ? `${toolEnv.PUB_ENVIRONMENT}:` : "") + "vscode.dart-code";
	if (process.env.DART_CODE_IS_TEST_RUN) {
		toolEnv.PUB_ENVIRONMENT += ".test.bot";
		globalFlutterArgs.push("--suppress-analytics");
	}

	// Add on any overrides.
	if (envOverrides)
		toolEnv = Object.assign(toolEnv, envOverrides);
}
// TODO: Should we move this to extension activate?
setupToolEnv();

export function safeToolSpawn(workingDirectory: string | undefined, binPath: string, args: string[], envOverrides?: { [key: string]: string | undefined }): SpawnedProcess {
	const env = Object.assign({}, toolEnv, envOverrides) as { [key: string]: string | undefined } | undefined;
	return safeSpawn(workingDirectory, binPath, args, env);
}

/// Runs a process and returns the exit code, stdout, stderr. Always resolves even for non-zero exit codes.
export function runToolProcess(logger: Logger, workingDirectory: string | undefined, binPath: string, args: string[], envOverrides?: { [key: string]: string | undefined }): Promise<RunProcessResult> {
	return runProcess(logger, binPath, args, workingDirectory, envOverrides, safeToolSpawn);
}

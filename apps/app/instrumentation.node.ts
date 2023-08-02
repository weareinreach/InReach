/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { SentryPropagator, SentrySpanProcessor } from '@sentry/opentelemetry-node'
import { config } from 'dotenv'

config({ path: '../../.env' })
const otelTraceOptions = process.env.OTEL_SERVER ? { url: process.env.OTEL_SERVER } : undefined

if (!process.env.VERCEL) console.log('Initializing OpenTelemetry...')

if (otelTraceOptions) {
	console.log(`Using custom server: ${otelTraceOptions.url}`)
}

const sdk = new NodeSDK({
	resource: new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: 'inreach-app',
		[SemanticResourceAttributes.CLOUD_REGION]: process.env.VERCEL_REGION,
		[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.VERCEL_ENV,
		[SemanticResourceAttributes.HOST_ARCH]: process.arch,
		[SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: process.version,
		[SemanticResourceAttributes.OS_TYPE]: process.platform,
	}),
	traceExporter: new OTLPTraceExporter(otelTraceOptions),
	spanProcessor: new SentrySpanProcessor(),
	textMapPropagator: new SentryPropagator(),
	instrumentations: [new PrismaInstrumentation({ middleware: true })],
})
sdk.start()

/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// import { context, trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { config } from 'dotenv'

config({ path: '../../.env' })
const otelTraceOptions = process.env.OTEL_SERVER ? { url: process.env.OTEL_SERVER } : undefined
console.log('Initializing OpenTelemetry...')

if (otelTraceOptions) {
	console.log(`Using custom server: ${otelTraceOptions.url}`)
}
const sdk = new NodeSDK({
	resource: new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: 'inreach-app',
	}),
	spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter(otelTraceOptions)),
	instrumentations: [new PrismaInstrumentation({ middleware: true })],
})
sdk.start()

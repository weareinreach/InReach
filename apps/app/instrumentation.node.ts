/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// import { context, trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
// import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'
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
	}),
	spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter(otelTraceOptions)),
	instrumentations: [
		new PrismaInstrumentation({ middleware: true }),
		// new HttpInstrumentation({
		// 	ignoreIncomingRequestHook: (req) => false,
		// 	ignoreOutgoingRequestHook: (req) => {
		// 		const ignored = [
		// 			// ip addresses
		// 			/.*((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]).*/,
		// 			/.*localhost.*/,
		// 		]
		// 		const { hostname } = req
		// 		if (typeof hostname === 'string') return !ignored.some((rx) => rx.test(hostname))

		// 		return false
		// 	},
		// }),
	],
})
sdk.start()

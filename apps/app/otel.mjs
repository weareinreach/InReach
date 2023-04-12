// Imports
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { Resource } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'

// Configure the trace provider
const provider = new NodeTracerProvider({
	resource: new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: 'nextjs',
	}),
})

// Configure how spans are processed and exported. In this case we're sending spans
// as we receive them to an OTLP-compatible collector (e.g. Jaeger).
provider.addSpanProcessor(
	new SimpleSpanProcessor(new OTLPTraceExporter({ url: 'http://10.42.0.123:4318/v1/traces' }))
)

// Register your auto-instrumentors
registerInstrumentations({
	tracerProvider: provider,
	instrumentations: [new PrismaInstrumentation({ middleware: true })],
})
console.log('nextjs otel')

// Register the provider globally
provider.register()

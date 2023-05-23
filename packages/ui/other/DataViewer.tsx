import { Card, ScrollArea } from '@mantine/core'
import { JsonViewer, type JsonViewerProps } from '@textea/json-viewer'

export const DataViewer = ({ value, enableClipboard, dontCollapse, ...props }: DataViewerProps) => (
	<Card>
		<ScrollArea.Autosize mah='50vh'>
			<JsonViewer
				value={value}
				quotesOnKeys={false}
				style={{ fontSize: 12 }}
				enableClipboard={enableClipboard ?? false}
				indentWidth={2}
				defaultInspectDepth={dontCollapse ? 5 : 0}
				rootName={false}
				{...props}
			/>
		</ScrollArea.Autosize>
	</Card>
)

interface DataViewerProps extends JsonViewerProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any
	dontCollapse?: boolean
}

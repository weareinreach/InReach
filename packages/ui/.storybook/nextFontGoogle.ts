const font = new Proxy(
	{},
	{
		get: function getter(_, receiver) {
			return () => ({
				className: receiver,
			})
		},
	}
)
export default font

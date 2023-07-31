import { type GetStaticProps } from 'next'

const SearchRedirect = () => <></>
export const getStaticProps: GetStaticProps = async () => {
	return {
		redirect: {
			destination: '/',
			statusCode: 308,
		},
	}
}

export default SearchRedirect

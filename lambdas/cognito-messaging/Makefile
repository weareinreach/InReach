.PHONY: build-cognitomessaging
build-cognitomessaging:
	pnpm clean:dist
	pnpm install --ignore-scripts
	pnpm bundle
	cp package.json "$(ARTIFACTS_DIR)/"
	mv dist "$(ARTIFACTS_DIR)/"


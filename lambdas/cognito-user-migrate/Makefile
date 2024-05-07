.PHONY: build-usermigrate
build-usermigrate:
	pnpm clean:dist
	pnpm install --ignore-scripts
	pnpm aws:db:generate
	pnpm bundle
	pnpm prune-clients
	cp package.json "$(ARTIFACTS_DIR)/"
	mv dist/client/* dist/
	rm -fr dist/client
	mv dist "$(ARTIFACTS_DIR)/"
	turbo db:generate --filter=@weareinreach/db

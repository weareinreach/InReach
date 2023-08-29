# .PHONY: build-usermigrate

# build-usermigrate:
# 	# turbo prune --scope=@weareinreach/aws-user-migrate --out-dir "$(ARTIFACTS_DIR)"
# 	cd packages/aws-user-migrate
# 	pnpm install --ignore-scripts
# 	rm -fr dist
# 	pnpm aws:db:generate --filter @weareinreach/aws-user-migrate
# 	pnpm bundle --filter @weareinreach/aws-user-migrate
# 	pnpm prune-clients --filter @weareinreach/aws-user-migrate
# 	cp -r dist "$(ARTIFACTS_DIR)/"

# build-RuntimeDependenciesLayer:
# 	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
# 	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
# 	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
# 	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes aren't related to dependencies

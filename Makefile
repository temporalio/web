.PHONY:
$(VERBOSE).SILENT:

# default target
default: init

# git submodule for proto files

update-proto-submodule:
	@printf $(COLOR) "Update temporal-api submodule from remote..."
	git submodule update --force --remote $(PROTO_ROOT)

install-proto-submodule:
	@printf $(COLOR) "Install temporal-api submodule..."
	git submodule update --init $(PROTO_ROOT)

init: install-proto-submodule

update: update-proto-submodule

version:
	@echo "1.15.1"

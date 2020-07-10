.PHONY:
$(VERBOSE).SILENT:

# default target
default: install-proto-submodule

# git submodule for proto files

update-proto-submodule:
	@printf $(COLOR) "Update proto submodule from remote..."
	git submodule update --force --remote $(PROTO_ROOT)

install-proto-submodule:
	@printf $(COLOR) "Install proto submodule..."
	git submodule update --init $(PROTO_ROOT)
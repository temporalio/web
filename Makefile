.PHONY:
$(VERBOSE).SILENT:

# default target
default: update-proto-submodule

# git submodule for proto files

update-proto-submodule:
	git submodule update --init --remote $(PROTO_ROOT)

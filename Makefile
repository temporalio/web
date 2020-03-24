.PHONY: grpc clean grpc-install
$(VERBOSE).SILENT:

# default target
default: all-install all

# List only subdirectories with *.proto files.
# sort to remove duplicates.
PROTO_ROOT := temporal-proto
PROTO_DIRS = $(sort $(dir $(wildcard $(PROTO_ROOT)/*/*.proto)))
PROTO_SERVICES = $(wildcard $(PROTO_ROOT)/*/service.proto)
PROTO_OUT := ./server/grpc
PROTO_IMPORT := $(PROTO_ROOT)

all: all-install copyright gomodtidy

all-install: update-proto-submodule grpc

$(PROTO_OUT):
	mkdir $(PROTO_OUT)

# git submodule for proto files

update-proto-submodule:
	git submodule update --init --remote $(PROTO_ROOT)

# Compile proto files to go

grpc: web-protobuf

web-protobuf: clean $(PROTO_OUT)
	echo "Compiling grpc..."
	$(foreach PROTO_DIR,$(PROTO_DIRS),grpc_tools_node_protoc --proto_path=$(PROTO_IMPORT) --js_out=import_style=commonjs,binary:$(PROTO_OUT) --grpc_out=$(PROTO_OUT) --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` $(PROTO_DIR)*.proto;)

# Plugins & tools

# Add licence header to generated files

copyright:
	go run ./cmd/copyright/licensegen.go

# clean

clean:
	echo "Deleting generated go files..."
	rm -rf $(PROTO_OUT)/*/*.pb.*js
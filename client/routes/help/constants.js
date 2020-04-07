export const cliCommands = [
  {
    header: 'Namespace commands',
    commands: [
      {
        id: 'cli-command-namespace-register',
        label: 'Register a namespace (local only)',
        value:
          'tctl --namespace {namespace-name} namespace register --global_namespace false',
      },
      {
        id: 'cli-command-namespace-describe',
        label: 'List namespace settings',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace describe',
      },
      {
        id: 'cli-command-namespace-update-cluster',
        label:
          'Update namespace active cluster (Make sure the namespace_data has UberIgnoringLisa:true)',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace update -active_cluster {cluster-name}',
      },
      {
        id: 'cli-command-namespace-update-bad-binary',
        label: 'Update namespace bad binary',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} namespace update --add_bad_binary {bad-binary-SHA} --reason \'"{reason}"\'',
      },
    ],
  },
  {
    header: 'workflow commands',
    commands: [
      {
        id: 'cli-command-workflow-run',
        label: 'Run a workflow',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow run --tl {task-list-name} --wt {workflow-type-name} --et 60 -i \'"{input-string}"\'',
      },
      {
        id: 'cli-command-workflow-describe',
        label: 'See workflow settings',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow describe -w {workflow-id} -r {run-id}',
      },
      {
        id: 'cli-command-workflow-show',
        label: 'See workflow history',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow show -w {workflow-id} -r {run-id}',
      },
      {
        id: 'cli-command-workflow-signal',
        label: 'Signal a workflow',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow signal -w {workflow-id} -r {run-id} --name {signal-name} --input \'"{signal-payload}"\'',
      },

      {
        description: [
          'Where event_id is the event to reset from',
          'and reset_type can be FirstDecisionTaskCompleted, LastDecisionTaskCompleted, LastContinueAsNew, BadBinary',
        ],
        id: 'cli-command-workflow-reset',
        label: 'Reset a workflow',
        value:
          'tctl workflow reset -w {workflow-id} -r {run-id} --event_id {event-id} --reason \'"{reason}"\' --reset_type {reset-type} --reset_bad_binary_checksum {bad-binary-SHA}',
      },
      {
        description: [
          'Where query can be any query that returns a list of workflows',
          'and reset_type can be FirstDecisionTaskCompleted, LastDecisionTaskCompleted, LastContinueAsNew, BadBinary',
        ],
        id: 'cli-command-workflow-reset-batch',
        label: 'Reset a batch of workflows',
        value:
          'tctl workflow reset-batch --query \'"{query}"\' --only_non_deterministic --reason \'"{reason}"\' --reset_type {reset-type}',
      },
      {
        id: 'cli-command-workflow-list',
        label: 'List closed workflows',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow {list|listall}',
      },
      {
        id: 'cli-command-workflow-list-open',
        label: 'List open workflows',
        value:
          'tctl --env {staging|prod|prod02} --namespace {namespace-name} workflow {list|listall} --open',
      },
      {
        id: 'cli-command-workflow-query',
        label: 'Query for a workflow',
        value:
          'tctl workflow {list|listall} --query \'(CustomKeywordField = "keyword1" and CustomIntField >= 5) or CustomKeywordField = "keyword2" and CloseTime = missing\'',
      },
    ],
  },
];

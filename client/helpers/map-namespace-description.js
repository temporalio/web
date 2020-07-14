export default function(namespace) {
  const {
    config: {
      emitMetric,
      historyArchivalState,
      workflowExecutionRetentionPeriodInDays,
      visibilityArchivalState,
    } = {},
    namespaceInfo: { description, ownerEmail } = {},
    failoverVersion,
    isGlobalNamespace,
    replicationConfig: { activeClusterName, clusters = [] } = {},
  } = namespace || {};

  return {
    description: description || 'No description available',
    owner: ownerEmail || 'Unknown',
    'Global?': isGlobalNamespace ? 'Yes' : 'No',
    'Retention Period': workflowExecutionRetentionPeriodInDays
      ? `${workflowExecutionRetentionPeriodInDays} days`
      : 'Unknown',
    'Emit Metrics': emitMetric ? 'Yes' : 'No',
    'History Archival':
      historyArchivalState == 'Enabled' ? 'Enabled' : 'Disabled',
    'Visibility Archival':
      visibilityArchivalState == 'Enabled' ? 'Enabled' : 'Disabled',
    ...(failoverVersion !== undefined && {
      'Failover Version': failoverVersion,
    }),
    clusters: clusters.length
      ? clusters
          .map(({ clusterName }) =>
            clusterName === activeClusterName
              ? `${clusterName} (active)`
              : clusterName
          )
          .join(', ')
      : 'Unknown',
  };
}

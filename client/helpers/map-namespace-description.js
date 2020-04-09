export default function(namespace) {
  const {
    configuration: {
      emitMetric,
      historyArchivalStatus,
      workflowExecutionRetentionPeriodInDays,
      visibilityArchivalStatus,
    } = {},
    namespaceInfo: { description, ownerEmail } = {},
    failoverVersion,
    isGlobalNamespace,
    replicationConfiguration: { activeClusterName, clusters = [] } = {},
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
      historyArchivalStatus === 'ENABLED' ? 'Enabled' : 'Disabled',
    'Visibility Archival':
      visibilityArchivalStatus === 'ENABLED' ? 'Enabled' : 'Disabled',
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

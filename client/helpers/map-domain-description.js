export default function(d) {
  // eslint-disable-next-line no-param-reassign
  d.configuration = d.configuration || {};
  // eslint-disable-next-line no-param-reassign
  d.replicationConfiguration = d.replicationconfiguration || {
    clustersList: [],
  };

  return {
    description: d.domaininfo.description,
    owner: d.domaininfo.owneremail,
    'Global?': d.isglobaldomain ? 'Yes' : 'No',
    'Retention Period': `${d.configuration.workflowexecutionretentionperiodindays} days`,
    'Emit Metrics': d.configuration.emitmetric ? 'Yes' : 'No',
    'Failover Version': d.failoverversion,
    clusters: d.replicationConfiguration.clustersList
      .map(c =>
        c.clustername === d.replicationConfiguration.activeclustername
          ? `${c.clustername} (active)`
          : c.clustername
      )
      .join(', '),
  };
}

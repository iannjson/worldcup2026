const HOSTS = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];

function Badge({ letter, type }) {
  return <span className={`badge ${type}`}>{letter}</span>;
}

export default function ScenarioTable({ scenarios, searchTokens }) {
  if (scenarios.length === 0) {
    return <p className="empty">No official combinations match your criteria.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Advancing 3rds (8)</th>
            <th>Eliminated (4)</th>
            {HOSTS.map((host) => (
              <th key={host}>{`1${host} vs`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario.id}>
              <td>#{scenario.id}</td>
              <td>
                {scenario.advancing.map((group) => (
                  <Badge key={`${scenario.id}-a-${group}`} letter={group} type="advancing" />
                ))}
              </td>
              <td>
                {scenario.eliminated.map((group) => (
                  <Badge key={`${scenario.id}-e-${group}`} letter={group} type="eliminated" />
                ))}
              </td>
              {scenario.matchups.map((group, index) => {
                const token = `1${HOSTS[index]}-3${group}`;
                const isHighlighted = searchTokens.includes(token);
                return (
                  <td key={`${scenario.id}-m-${index}`} className={isHighlighted ? 'highlight' : ''}>
                    {`3${group}`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

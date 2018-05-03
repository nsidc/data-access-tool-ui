import * as React from 'react';

interface GranuleListProps {
    collectionId: string,
    boundingBox: any
}

export class GranuleList extends React.Component<GranuleListProps> {
    render() {
        return (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Summary</th>
                  <th>Granules</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
        )
    }
}

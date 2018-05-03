import * as React from 'react';

import { BoundingBox } from '../BoundingBox';

interface GranuleListProps {
    collectionId: string,
    boundingBox: BoundingBox
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

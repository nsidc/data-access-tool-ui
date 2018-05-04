import * as React from "react";

import { BoundingBox } from "../BoundingBox";

interface GranuleListProps {
    collectionId: string;
    boundingBox: BoundingBox;
    granules: any;
}

export class GranuleList extends React.Component<GranuleListProps> {
    render() {
        let granuleList = this.props.granules.map((g: any) => (
            <tr>
              <td>{g.producer_granule_id}</td>
              <td>{g.granule_size}</td>
              <td>{g.time_start}</td>
              <td>{g.time_end}</td>
            </tr>
        ));
        return (
            <table>
              <thead>
                <tr>
                  <th>Granule ID</th>
                  <th>Size (Hectares)</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {granuleList}
              </tbody>
            </table>
        );
    }
}

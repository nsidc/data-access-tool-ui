// Note: The current plan is to change this to a counter-clockwise polygon.
export interface SpatialSelection {
    readonly [key: string]: number;
    readonly lower_left_lon: number;
    readonly lower_left_lat: number;
    readonly upper_right_lon: number;
    readonly upper_right_lat: number;
}

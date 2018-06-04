export const Color = jest.fn();
export const Ellipsoid = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
      mockColor: Color,
      mockEllipsoid: Ellipsoid,
    };
});

export default mock;

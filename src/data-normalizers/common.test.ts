import { flattenByProperty, CommonProperties } from "./common";
import { Owner } from "./types";

describe("flattenByProperty", () => {
  const targetProperty = "weapon_bag";
  const testData = {
    afrika_korps: {
      ballistic_weapon: {
        anti_tank_gun: {
          "75mm_at_gun_ak": {
            weapon_bag: {
              accuracy: {
                near: 0.07,
                far: 0.04,
                mid: 0.045,
              },
              aim: {
                fire_aim_time: {
                  max: 0.5,
                  min: 0.5,
                },
              },
            },
          },
        },
      },
    },
  };

  it("should flatten the data when target property is found", () => {
    const flattenedData = flattenByProperty(targetProperty, testData);
    const expectedData: CommonProperties<"id">[] = [
      {
        path: "/afrika_korps/ballistic_weapon/anti_tank_gun/75mm_at_gun_ak",
        owner: "afrika_korps",
        weapon_bag: {
          accuracy: {
            near: 0.07,
            far: 0.04,
            mid: 0.045,
          },
          aim: {
            fire_aim_time: {
              max: 0.5,
              min: 0.5,
            },
          },
        },
      },
    ];

    expect(flattenedData).toEqual(expectedData);
  });

  // it('should flatten the data when target property is found in nested object', () => {
  //   const flattenedData = flattenByProperty(targetProperty, testData.address);
  //   const expectedData = [
  //     {
  //       path: 'address',
  //       owner: 'address',
  //       id: '2',
  //       street: '123 Main St',
  //       city: 'Anytown',
  //       state: 'CA',
  //       zip: '12345',
  //     },
  //   ];

  //   expect(flattenedData).toEqual(expectedData);
  // });

  // it('should flatten the data when target property is found in nested array of objects', () => {
  //   const flattenedData = flattenByProperty(targetProperty, testData.pets[0]);
  //   const expectedData= [
  //     {
  //       path: 'pets.0',
  //       owner: 'pets',
  //       id: '3',
  //       name: 'Fluffy',
  //       species: 'cat',
  //     },
  //   ];

  //   expect(flattenedData).toEqual(expectedData);
  // });

  // it("should return an empty array when target property is not found", () => {
  //   const flattenedData = flattenByProperty("unknownProperty", testData);
  //   const expectedData = [];

  //   expect(flattenedData).toEqual(expectedData);
  // });
});

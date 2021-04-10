import renderer from "react-test-renderer"
import { Menu } from "../../src/components/shared/Menu"

it(`renders correctly`, () => {
  const component = renderer
    .create(
      Menu({
        title: `TEST`,
        options: [
          {
            label: `Test label`,
            value: `test_value`,
          },
        ],
        onSelectHandler: () => {},
      })
    )
    .toJSON()

  // https://jestjs.io/docs/snapshot-testing
  expect(component).toMatchSnapshot()
})

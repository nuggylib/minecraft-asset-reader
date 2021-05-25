import renderer from "react-test-renderer"
import { Tab } from "../../src/core/components/shared/Tab"

it(`renders correctly`, () => {
  const component = renderer
    .create(
      Tab({
        count: 3,
      })
    )
    .toJSON()

  // https://jestjs.io/docs/snapshot-testing
  expect(component).toMatchSnapshot()
})

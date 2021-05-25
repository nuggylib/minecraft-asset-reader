import renderer from "react-test-renderer"
import { ArrayTextBlock } from "../../src/core/components/shared/ArrayTextBlock"

it(`renders correctly`, () => {
  const component = renderer
    .create(
      ArrayTextBlock({
        label: `TEST`,
        nestingDepth: 2,
        array: [`test_string`, `another_test_string`],
      })
    )
    .toJSON()

  // https://jestjs.io/docs/snapshot-testing
  expect(component).toMatchSnapshot()
})

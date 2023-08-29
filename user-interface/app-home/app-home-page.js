const {
  HomeTab,
  Header,
  Divider,
} = require('slack-block-builder');

module.export = () => {
  const homeTab = HomeTab().blocks(
    Header({
      text: ':star: Recommended'
    }),
    Divider()
  )
  return homeTab.buildToJSON();
}

  
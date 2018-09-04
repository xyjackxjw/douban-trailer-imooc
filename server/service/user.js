const mongoose = require('mongoose')
const User = mongoose.model('User')

export const checkPassword = async (email, password) => {
  let match = false
  const user = await User.findOne({ email })

  console.log('取得数据库密码' + user.password)

  if (user) {
    match = await user.comparePassword(password, user.password)
  }

  return {
    match,
    user
  }
}
import _ from 'lodash'

export const mergeInvitationAttr = (objValue, srcValue, key) => {
  if (!_.isUndefined(srcValue) && srcValue) {
    return srcValue
  } else {
    return objValue
  }
}
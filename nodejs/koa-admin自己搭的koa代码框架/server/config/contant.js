module.exports = {
    name_reg:/^[a-z\u4e00-\u9fa5]{3,10}$/i, //帐号验证
    name_txt:'3至10个英文或中文字符', //帐号规则
    pass_reg:/^(?=.*[a-z])(?=.*\d)[a-z\d]{6,12}$/i, //密码验证
    defaultPassword:'88888888888a', //默认密码：当修改用户信息时不更改密码的标识
    pass_txt:'6至12个英文和数字组成的字符', //密码规则
};
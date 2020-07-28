const {createHash} = require('crypto');
const NodeRSA = require('node-rsa');

const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('hex')
}

/**
 * @param {any} content
 *  @return {string}
 */
const sha1 = (content) => encrypt('sha1', content)

module.exports = (options = {}, context) => ({
  extendPageData ($page) {
    const trimedContent = $page._strippedContent;
    if(!trimedContent) return;
    
    const hash = sha1(trimedContent);
    const key = new NodeRSA({b: 512});
    const sign = key.encrypt(hash, 'base64');
    // console.log('hash:', hash)
    // console.log('sign:', sign);
    $page.contentSign = sign
  }
})


import jsdom from 'mocha-jsdom'
import { expect } from 'chai'
import { getPage, getReferrer, loadedDomain } from '../../../src/utils/page'

describe('Page Utils', () => {
  jsdom({
    url: 'https://liveintent.com/about?key=value',
    referrer: 'https://first.example.com?key=value',
    useEach: true
  })

  it('loaded domain should return the host', function () {
    expect(loadedDomain()).to.be.eql('liveintent.com')
    document.domain = null
    expect(loadedDomain()).to.be.eql('liveintent.com')
    document.location = null
    expect(loadedDomain()).to.be.eql('liveintent.com')
  })

  it('getPage should return the url for the top-level window', function () {
    expect(getPage()).to.be.eql('https://liveintent.com/about?key=value')
  })

  it('getPage should return the url for the iframe', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)

    expect(getPage(iframe.contentWindow)).to.be.eql('https://liveintent.com/about?key=value')
  })

  it('getPage should return the url for the nested iframe', function () {
    const iframe1 = document.createElement('iframe')
    document.documentElement.appendChild(iframe1)
    const iframe2 = iframe1.contentDocument.createElement('iframe')
    iframe1.contentDocument.documentElement.appendChild(iframe2)
    iframe2.src = 'https://double.nested.com/about?key=value'

    expect(getPage(iframe2.contentWindow)).to.be.eql('https://liveintent.com/about?key=value')
  })

  it('getPage should return the url when the window location is not defined', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)
    definedProperty(window, 'location', () => { return undefined })

    expect(getPage(iframe.contentWindow)).to.be.eql('https://liveintent.com/about?key=value')
  })

  it('getPage should return the iframe url when the window url and the iframe referrer are not defined', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)
    definedProperty(window, 'location', () => { return undefined })
    definedProperty(iframe.contentWindow, 'document', () => { return undefined })

    expect(getPage(iframe.contentWindow)).to.be.eql('https://nested.liveintent.com/about?key=value')
  })

  it('getPage should return the origin when only ancestor origins are defined', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)
    definedProperty(window, 'location', () => { return undefined })
    definedProperty(iframe.contentWindow, 'document', () => { return undefined })
    definedProperty(iframe.contentWindow, 'location', () => {
      return {
        href: undefined,
        ancestorOrigins: { 0: 'https://liveintent.com/' }
      }
    })

    expect(getPage(iframe.contentWindow)).to.be.eql('https://liveintent.com/')
  })

  it('getPage should not return the url when it is not defined', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)
    definedProperty(window, 'location', () => { return undefined })
    definedProperty(iframe.contentWindow, 'document', () => { return undefined })
    definedProperty(iframe.contentWindow, 'location', () => { return undefined })

    expect(getPage(iframe.contentWindow)).to.be.undefined
  })

  it('getReferrer should return the referrer for the top-level window', function () {
    expect(getReferrer()).to.be.eql('https://first.example.com?key=value')
  })

  it('getReferrer should not return the referrer when the top is not defined', function () {
    definedProperty(window, 'top', () => { return undefined })

    expect(getReferrer()).to.be.undefined
  })

  it('getReferrer should return the referrer for the iframe', function () {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://nested.liveintent.com/about?key=value'
    document.documentElement.appendChild(iframe)

    expect(getReferrer(iframe.contentWindow)).to.be.eql('https://first.example.com?key=value')
  })

  it('getReferrer should return the referrer for the nested iframe', function () {
    const iframe1 = document.createElement('iframe')
    document.documentElement.appendChild(iframe1)
    const iframe2 = iframe1.contentDocument.createElement('iframe')
    iframe1.contentDocument.documentElement.appendChild(iframe2)
    iframe2.src = 'https://double.nested.com/about?key=value'

    expect(getReferrer(iframe2.contentWindow)).to.be.eql('https://first.example.com?key=value')
  })
})

function definedProperty (object, name, getter) {
  Object.defineProperty(object, name, {
    get: getter
  })
}

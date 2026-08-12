import { expect } from '@wdio/globals'
import { ReviewOfferPage } from 'page-objects/review-offer.page.js'
import { ViewAgreementPage } from 'page-objects/view-agreement.page.js'
import * as constants from '../../support/constants.js'
import { createTestAgreement } from '../../support/agreement-helper.js'
import { getAgreement } from '../../services/get-agreement.js'
import { LoginPage } from 'page-objects/login.page.js'
import wmpOffer from '../../data/wmp_create_offer.json'
const reviewOfferPage = new ReviewOfferPage()
const viewAgreementPage = new ViewAgreementPage()
const loginPage = new LoginPage()

describe('Given the applicant has received the WMP offer', () => {
  describe('When the applicant views the WMP agreement page', () => {
    let agreementId, sbi, agreementData

    before(async () => {
      const agreement = await createTestAgreement(wmpOffer)
      agreementId = agreement.agreementId
      agreementData = await getAgreement(agreementId)
      console.log('agreementData', agreementData)
      sbi = agreement.sbi

      await loginPage.login(sbi)
      await reviewOfferPage.clickPrintableAgreementLinkAndSwitchTab()
    })

    it('Then should show the WMP Farm Details', async () => {
      const text = await viewAgreementPage.getFarmName()
      expect(text).toContain(constants.WMP_FARM_NAME)
      expect(await viewAgreementPage.getSBI()).toBe(sbi)
      expect(await viewAgreementPage.getFarmerName()).toBe(
        constants.WMP_FARMER_NAME
      )
    })

    it('Then should show Privacy link in footer on WMP agreement', async () => {
      const privacyLink = await viewAgreementPage.getFooterLinkByText(
        'Privacy (opens in new tab)'
      )

      await expect(privacyLink).toBeExisting()
      await expect(privacyLink).toBeDisplayed()
    })

    it('And should show Cookies link in footer on WMP agreement', async () => {
      const cookiesLink = await viewAgreementPage.getFooterLinkByText('Cookies')

      await expect(cookiesLink).toBeExisting()
      await expect(cookiesLink).toBeDisplayed()
    })

    it('Then should display draft agreement notification message on WMP agreement', async () => {
      const expectedText = 'This is a draft version of your agreement'

      const bannerMessage =
        await viewAgreementPage.getDraftAgreementMessageForWMPGrant()

      await expect(bannerMessage).toBeDisplayed()
      await expect(bannerMessage).toHaveText(expectedText)
    })

    it('Then should show Header on WMP agreement', async () => {
      expect(await viewAgreementPage.getHeading()).toBe(
        constants.WMP_AGREEMENT_NAME_HEADER
      )
      expect(await viewAgreementPage.getAgreementHolder()).toBe(
        constants.WMP_FARM_NAME
      )
      expect(await viewAgreementPage.getSBIValue()).toBe(sbi)
      expect(await viewAgreementPage.getAddress()).toBe(
        constants.DEFAULT_ADDRESS
      )
      expect(await viewAgreementPage.getAgreementName()).toBe(
        constants.WMP_AGREEMENT_NAME
      )
      expect(await viewAgreementPage.getAgreementNumber()).toBe(agreementId)
      expect(await viewAgreementPage.getStartDate()).toBe('XXXXX')
      expect(await viewAgreementPage.getEndDate()).toBe('XXXXX')
    })

    it('Then should display all expected sub-headers on WMP agreement', async () => {
      for (const header of constants.CAPITAL_ITEMS_SUB_HEADERS) {
        const element = await viewAgreementPage[header.element]
        await expect(element).toBeDisplayed()
        await expect(element).toHaveText(header.expected)
      }
    })

    it('Then should display all expected contents links on WMP agreement', async () => {
      for (const link of constants.CAPITAL_ITEMS_EXPECTED_CONTENTS) {
        const element = await viewAgreementPage[link.element]
        await expect(element).toBeDisplayed()
        await expect(element).toHaveText(link.expected)
      }
    })

    it('Then should show the Print this page button on WMP agreement', async () => {
      expect(await viewAgreementPage.getPrintButtonText()).toBe(
        'Print this page'
      )
      expect(await viewAgreementPage.getPrintButtonClass()).toContain(
        'gem-c-print-link__button'
      )
      expect(await viewAgreementPage.isPrintButtonClickable()).toBe(true)
      expect(await viewAgreementPage.getPrintButtonDataModule()).toBe(
        'print-link'
      )
    })

    it('Then should display - Land covered by the agreement on WMP agreement', async () => {
      const parcelCellOne = await viewAgreementPage.getAgreementTableCell(
        'landTable',
        0,
        0
      )
      const areaCellOne = await viewAgreementPage.getAgreementTableCell(
        'landTable',
        0,
        1
      )
      const parcelCellTwo = await viewAgreementPage.getAgreementTableCell(
        'landTable',
        1,
        0
      )
      const areaCellTwo = await viewAgreementPage.getAgreementTableCell(
        'landTable',
        1,
        1
      )

      // Wait until displayed
      await parcelCellOne.waitForDisplayed()
      await areaCellOne.waitForDisplayed()
      await parcelCellTwo.waitForDisplayed()
      await areaCellTwo.waitForDisplayed()

      await expect(parcelCellOne).toHaveText(
        constants.EXPECTED_PARCEL.replace(/\s+/g, '-').trim()
      )
      await expect(areaCellOne).toHaveText(constants.EXPECTED_AREA.trim())
      await expect(parcelCellTwo).toHaveText(
        constants.EXPECTED_PARCEL_TWO.replace(/\s+/g, '-').trim()
      )
      await expect(areaCellTwo).toHaveText(constants.EXPECTED_AREA_TWO.trim())
    })

    it('Then should display - Summary of actions on WMP agreement', async () => {
      const expectedValues = [
        ['WMP1', 'Produce a woodland management plan', '15.75']
      ]

      for (let row = 0; row < expectedValues.length; row++) {
        for (let col = 0; col < expectedValues[row].length; col++) {
          const element = await viewAgreementPage.getWMPTableCell(
            'capitalItemsTable',
            row,
            col
          )

          console.log(element)
          console.log('element***********')
          await expect(element).toBeDisplayed()
          await expect(element).toHaveText(expectedValues[row][col])
        }
      }
    })

    it('Then should display - Summary of payments on WMP agreement', async () => {
      await expect(
        viewAgreementPage.getAgreementTotalCell('paymentsTable')
      ).toHaveText('£1,575')
    })

    it('Then should display - Agreement start and end dates', async () => {
      const expectedStartDate = 'XXXXX'
      const expectedEndDate = 'XXXXX'
      const startDateElement = await viewAgreementPage.getAgreementDate(
        'Agreement Start Date:'
      )
      const endDateElement = await viewAgreementPage.getAgreementDate(
        'Agreement End Date:'
      )
      await expect(startDateElement).toBeDisplayed()
      await expect(startDateElement).toHaveText(expectedStartDate)
      await expect(endDateElement).toBeDisplayed()
      await expect(endDateElement).toHaveText(expectedEndDate)
    })
  })
})

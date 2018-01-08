
const TURBINES_SIZE = 160;
describe('PowerBoard', function () {
  it('<title> is "RWE Operator Dashboard"', function () {
    cy.visit('http://localhost:3000/')
    cy.title().should('include', 'RWE Operator Dashboard')
  })

  it(`park total chart shows data`, function () {
    cy.get('.park-total path.park-total').should('have.length', 1).should('have.attr', 'd')
  })

  it(`grid contains ${TURBINES_SIZE} turbines`, function () {
    cy.get('.matrix-container .turbine-compact-component').should('have.length', TURBINES_SIZE);
  })

  it('turbine shows active power', function () {
    cy.get('.matrix-container .turbine-compact-component').first().within(function () {

      cy.get('.value i').should('not.be.visible');

      cy.get('.value').should(($div) => {
        const text = $div.text()

        expect(text).to.match(/-?\d\.\d/)// example: -0.0, 0.9
        expect(text).not.to.include('N/A')
      });
    })

  });

  context('Filter', function () {
    it('Unavailable filter contains number', function () {
      let filterBtn = cy.get('.button-bar-component .is-unavailable');

      filterBtn.find('.icon-n-value-holder').should(($div) => {
        const text = $div.text();

        expect(text).to.match(/\d+/);
        expect(text).not.to.include('N/A');
        this.unavailableNr = text;
      });
    })
    it('Click on Unavailable filter dimmes all except unavailable', function () {
      let filterBtn = cy.get('.button-bar-component .is-unavailable');

      filterBtn.click();
      cy.get('.matrix-container .turbine-compact-component.dimmed').should('have.length', TURBINES_SIZE - this.unavailableNr);
    })
  })
})

const URL_DATASET = 'https://data.planetos.com/datasets';
const MAP_OVERLAY_TIMEOUT = 30000;
describe('Datahub', function () {
  it('<title> is "Planet OS"', function () {
    cy.visit('https://data.planetos.com')
    cy.title().should('include', 'Planet OS')
  })

  it('clicking search result item opens it in new window', function () {
    cy.visit(URL_DATASET);

    const input = cy.get('.filters')
      .contains('variable names')
      .next('.Select').find('.Select-input input').as('variableNames')

    // Search item
    cy.get('@variableNames').type('a', { force: true })
    cy.get('.filters').contains('air density');// Wait until data is loaded
    cy.get('@variableNames').type('ir density{enter}', { force: true });


    cy.get('.datasets-header').should('contain', 'Datasets that match your filter selection: 1');

    const item = cy.get('.datasets .dataset-upper').eq(0);
    item.should('have.attr', 'target', '_blank');

    // prevent from opening in new tab
    item.invoke('removeAttr', 'target')

    //open item
    item.click({ force: true });

    // after clicking the <a> we are now navigated to the
    // new page and we can assert that the url is correct
    cy.url().should('include', '/fmi_silam_global05')
  })
  context('Dataset: fmi_silam_global05', function () {
    before(function () {
      cy.visit(URL_DATASET + '/fmi_silam_global05');
    })

    it('<title> is "Planet OS - Finnish Meteorological Institute - System for Integrated modeLling of Atmospheric coMposition (SILAM)"', function () {
      cy.title().should('equals', 'Planet OS - Finnish Meteorological Institute - System for Integrated modeLling of Atmospheric coMposition (SILAM)')
    });

    it('Loads overlay image', function () {
      cy.get('.leaflet-overlay-pane img', { timeout: MAP_OVERLAY_TIMEOUT }).as('variableNames')

      cy.readFile('cypress/fixtures/fmi_silam_global05_daymax_cnc_NO2.png', 'base64').then((str) => {
        cy.get('@variableNames').should('have.attr', 'src', 'data:image/png;base64,' + str);
      })
    });
    it('Publisher is "Finnish Meteorological Institute (FMI)"', function () {
      cy.get('.content-section').contains('Publisher').next().should('contain', 'Finnish Meteorological Institute (FMI)')
    });

    it('Source is "Model"', function () {
      cy.get('.content-section').contains('Source').next().should('contain', 'Model')
    });
  })



  context('Search fields', function () {
    before(function () {
      cy.visit(URL_DATASET);
    })
    it('first input has placeholder: Search by keyword', function () {
      cy.get('.filters-keyword input').should('have.attr', 'placeholder', 'Search by keyword');
    })

    it('first input has search icon class', function () {
      cy.get('.filters-keyword div').should('have.class', 'filters-search-icon');
    })

  })
  context('Searching', function () {
    beforeEach(function () {
      cy.visit(URL_DATASET);
    })

    it('by "weekly" - lists 3 items', function () {
      cy.get('.filters-keyword input').type('weekly');
      cy.get('.datasets .dataset').should('have.length', 3);
    })

    it('by "air density" - lists 1 item', function () {
      const input = cy.get('.filters')
        .contains('variable names')
        .next('.Select').find('.Select-input input').as('variableNames')

      cy.get('@variableNames').type('a', { force: true })
      cy.get('.filters').contains('air density');// Wait until data is loaded
      cy.get('@variableNames').type('ir density{enter}', { force: true });

      cy.get('.datasets .dataset').should('have.length', 1);
    })



    const drawRect = (selector, x1, y1, x2, y2) => {
      cy.get(selector)
        .trigger('mousedown', { which: 1, clientX: x1, clientY: y1 })
        .trigger('mousemove', { clientX: x2, clientY: y2 })
        .trigger('mouseup', { force: true });
    }
    //Depends running environment resolution, TODO: can be set
    it('by drawing a rectangle on map - searches by map selection', function () {
      let selection = cy.get('.app-main-panel .leaflet-interactive')
      selection.should('not.be.visible')
      cy.get('.datasets-selectors .selector-label').should('not.have.text', 'Map')

      cy.get('.app-main-panel .leaflet-draw-draw-rectangle').click();
      drawRect('.app-main-panel .leaflet-container', 670, 150, 750, 200);

      selection.should('be.visible')

      // Shows Map filter
      cy.get('.datasets-selectors .selector-label').should('have.text', 'Map');
      cy.get('.datasets-header').should('contain', 'Datasets that match your filter selection');
    })
  })

})

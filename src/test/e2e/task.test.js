describe('UpcomingTaskComponent', () => {
    beforeEach(() => {
        // Load the HTML page containing the component
        cy.visit('path/to/your/component/page.html');
    });

    it('should display the correct number of upcoming tasks', () => {
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.number')
            .should('contain.text', '2 Upcoming Tasks');
    });

    it('should open and display the popup with task details when clicked', () => {
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.task')
            .click();
        
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.popup')
            .should('have.class', 'visible');
        
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.task-list li')
            .should('have.length', 2);
        
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.task-list li')
            .first()
            .should('contain.text', 'cse110');
    });

    it('should close the popup when the close button is clicked', () => {
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.task')
            .click();
        
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.popup .close-btn')
            .click();
        
        cy.get('upcoming-task-component[data-id="2"]')
            .shadow()
            .find('.popup')
            .should('not.have.class', 'visible');
    });
});

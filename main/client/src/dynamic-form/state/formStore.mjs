/**
 * Simple Vanilla JS State Manager for the Form Builder.
 * Implements a basic Publish/Subscribe pattern.
 */
class FormStore {
    constructor() {
        // Initial State Schema
        this.state = {
            title: 'Untitled Form',
            description: '',
            sections: []
        };
        
        this.listeners = [];
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of a state change
     */
    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }

    /**
     * Get a deep copy of the current state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Update basic form metadata
     */
    updateMetadata(title, description) {
        this.state.title = title;
        this.state.description = description;
        this.notify();
    }

    /**
     * Add a new section to the form
     */
    addSection() {
        const newSection = {
            id: 'sec_' + Date.now(),
            title: 'New Section',
            description: '',
            order: this.state.sections.length,
            questions: []
        };
        this.state.sections.push(newSection);
        this.notify();
    }

    /**
     * Add a new question to a specific section
     */
    addQuestion(sectionId, type = 'text') {
        const section = this.state.sections.find(s => s.id === sectionId);
        if (section) {
            const newQuestion = {
                id: 'q_' + Date.now(),
                type: type,
                text: 'New Question',
                required: false,
                order: section.questions.length,
                options: [],
                validations: [],
                visibilityRules: []
            };
            section.questions.push(newQuestion);
            this.notify();
        }
    }

    /**
     * Update a specific field in a question
     */
    updateQuestion(sectionId, questionId, updates) {
        const section = this.state.sections.find(s => s.id === sectionId);
        if (section) {
            const questionIndex = section.questions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
                section.questions[questionIndex] = {
                    ...section.questions[questionIndex],
                    ...updates
                };
                this.notify();
            }
        }
    }

    /**
     * Remove a question
     */
    removeQuestion(sectionId, questionId) {
        const section = this.state.sections.find(s => s.id === sectionId);
        if (section) {
            section.questions = section.questions.filter(q => q.id !== questionId);
            this.notify();
        }
    }
}

export const formStore = new FormStore();

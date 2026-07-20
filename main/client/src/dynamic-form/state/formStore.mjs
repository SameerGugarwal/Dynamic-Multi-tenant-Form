/**                                            
 * Simple Vanilla JS State Manager for the Form Builder.                                         
 * Implements a basic Publish/Subscribe pattern.
 */  

class FormStore {
    constructor() {
        // initial state schema 
        this.state = {
            title: 'Untitled Form',
            description: '',
            sections: [] 
        };
        this.listeners = [];
        this.isDirty = false;
    }
    
    // subscribe to state changes 
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    // notify all the users of a state change 
    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }
    
    // get a deep copy of the current state 
    getState(){
        return JSON.parse(JSON.stringify(this.state));
    }
    
    // load an entier state object (existing forms ko edit karne me usefull hota he !!)
    loadState(newState){
        this.state = JSON.parse(JSON.stringify(newState));
        this.isDirty = false;
        this.notify();
    }
    
    // update basic from matadata
    updateMetadata(title, description){
        this.state.title = title;
        this.state.description = description;
        this.isDirty = true;
        this.notify();
    }
    
    // add a new section to the form
    addSection(){
        const newSection ={
            id: 'sec_' + Date.now(),
            title: 'new Section',
            description: '',
            order: this.state.sections.length,
            questions: []
        };
        this.state.sections.push(newSection);
        this.isDirty = true;
        this.notify();
    }
    
    // Update a specific section's metadata  
    updateSection(sectionId, updates) {
        const sectionIndex = this.state.sections.findIndex(s => s.id === sectionId);
        if(sectionIndex !== -1){
            this.state.sections[sectionIndex] = {...this.state.sections[sectionIndex], ...updates};
            this.isDirty = true;
            this.notify();
        }
    }
    
    // remove an entier section 
    removeSection(sectionId){
        this.state.sections = this.state.sections.filter(s => s.id !== sectionId);
        this.isDirty = true;
        this.notify();
    }
    
    //Add a new question to a specific section
    addQuestion(sectionId, type = 'text'){
        const section = this.state.sections.find(s => s.id === sectionId);
        if (section){
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
            this.isDirty = true;
            this.notify();
        }
    }
    
    // Update a specific field in a question 
    updateQuestion(sectionId, questionId, updates){
        const section = this.state.sections.find(s => s.id === sectionId);
        if(section){
            const questionIndex = section.questions.findIndex(q => q.id === questionId);
            if(questionIndex !== -1){
                section.questions[questionIndex] = { ...section.questions[questionIndex], ...updates};
                this.isDirty = true;
                this.notify();
            }
        }
    }
    
    // remove a question 
    removeQuestion(sectionId, questionId){
        const section = this.state.sections.find(s => s.id === sectionId);
        if(section){
            section.questions = section.questions.filter(q => q.id !== questionId);
            this.isDirty = true;
            this.notify();
        }
    }
    // TODO: moveQuestion(sectionId, questionId, direction) - For Phase 6 Drag & Drop  
}

export const formStore = new FormStore();

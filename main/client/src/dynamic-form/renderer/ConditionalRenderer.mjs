export class ConditionalRenderer {
    static applyLogic(questionNode, isVisible) {
        if (isVisible) questionNode.classList.remove('hidden');
        else questionNode.classList.add('hidden');
    }
}

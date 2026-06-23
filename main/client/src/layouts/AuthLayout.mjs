export default class AuthLayout {
    mount(container, contentHtml) {
        container.innerHTML = '<div class="auth-layout bg-surface-50 min-h-screen">' + contentHtml + '</div>';
    }
}

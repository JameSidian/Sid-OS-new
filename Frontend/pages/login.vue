<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Login Form -->
    <div class="flex-1 flex flex-col justify-center items-center bg-[#faf9f6] px-8 py-12">
      <!-- Header with Logo -->
      <div class="w-full max-w-md mb-12">
        <div class="flex items-center gap-3 mb-8">
          <img 
            src="/logo.png" 
            alt="Sid Logo" 
            class="w-10 h-10 object-contain"
            @error="handleLogoError"
          />
          <span class="text-2xl font-serif font-bold text-slate-900">Sid</span>
        </div>
        
        <!-- Headline -->
        <h1 class="text-6xl font-serif font-bold text-slate-900 mb-4 leading-tight">
          Impossible?<br />Possible.
        </h1>
        
        <!-- Tagline -->
        <p class="text-xl text-slate-700 font-sans mb-12">
          The AI for problem solvers.
        </p>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Google Login Button -->
          <button
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 font-medium text-slate-900 mb-6"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <!-- Divider -->
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-slate-500 font-medium">OR</span>
            </div>
          </div>

          <!-- Email Input -->
          <div class="mb-6">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200 text-slate-900 placeholder-slate-400"
              @keyup.enter="handleEmailLogin"
            />
          </div>

          <!-- Email Login Button -->
          <button
            @click="handleEmailLogin"
            class="w-full px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            Continue with email
          </button>
        </div>

        <!-- Upgrade Link -->
        <div class="mt-6 text-center">
          <button class="text-sm text-slate-600 hover:text-slate-900 underline">
            Free plan · Upgrade
          </button>
        </div>
      </div>
    </div>

    <!-- Right Panel - Speckle Model Viewer -->
    <div class="flex-1 bg-[#FF6B35] flex items-center justify-center p-8 relative overflow-hidden">
      <!-- Speckle Iframe -->
      <div class="w-full h-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white">
        <iframe
          title="Speckle"
          src="https://app.speckle.systems/projects/bde23c9150/models/ed6dcfa446?embedToken=e461e6254c955d69750f5bc2db8d8d07e604a7f2a1#embed=%7B%22isEnabled%22%3Atrue%7D"
          width="100%"
          height="100%"
          frameborder="0"
          class="w-full h-full"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const email = ref('')

function handleLogoError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function handleGoogleLogin() {
  // TODO: Implement Google OAuth login
  console.log('Google login clicked')
  // For now, redirect to main app
  navigateTo('/')
}

function handleEmailLogin() {
  if (!email.value || !email.value.includes('@')) {
    alert('Please enter a valid email address')
    return
  }
  // TODO: Implement email login
  console.log('Email login:', email.value)
  // For now, redirect to main app
  navigateTo('/')
}
</script>

<style scoped>
/* Additional styling if needed */
</style>


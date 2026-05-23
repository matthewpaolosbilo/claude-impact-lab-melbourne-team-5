/**
 * Contract tests for the chat API wrappers.
 *
 * Pins the request body sent to `/api/chat` and `/api/chat/onboarding` against the
 * backend's ChatRequest schema (backend/routers/chat.py:51-58):
 *   { user_id: int, message: str, history: [{role, content}] }
 *
 * Also verifies the wrappers return the backend's response payload unchanged so the
 * caller (useMaxxer) can read `data.response` directly.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  api,
  sendChatMessage,
  sendOnboardingMessage,
} from './api'
import { mockChatReply } from './utils/maxxerMock'

describe('sendChatMessage', () => {
  let postSpy

  beforeEach(() => {
    postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        response: 'ok',
        suggested_event_ids: [1, 2, 3],
        onboarding_complete: true,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('posts { user_id, message, history } splitting the trailing user turn off the history', async () => {
    await sendChatMessage({
      userId: 7,
      messages: [
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'reply' },
        { role: 'user', content: 'current' },
      ],
    })

    expect(postSpy).toHaveBeenCalledWith('/api/chat', {
      user_id: 7,
      message: 'current',
      history: [
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'reply' },
      ],
    })
  })

  it('sends message:"" and history:[] for the bootstrap (empty messages) case', async () => {
    await sendChatMessage({ userId: 7, messages: [] })

    expect(postSpy).toHaveBeenCalledWith('/api/chat', {
      user_id: 7,
      message: '',
      history: [],
    })
  })

  it('returns the backend response payload unchanged so callers can read .response', async () => {
    const result = await sendChatMessage({
      userId: 7,
      messages: [{ role: 'user', content: 'hi' }],
    })

    expect(result).toEqual({
      response: 'ok',
      suggested_event_ids: [1, 2, 3],
      onboarding_complete: true,
    })
  })
})

describe('sendOnboardingMessage', () => {
  let postSpy

  beforeEach(() => {
    postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: {
        response: 'got it',
        suggested_event_ids: [4, 9, 11],
        onboarding_complete: true,
        preferences: {
          melbourne_reason: 'study',
          misses_from_home: ['family cooking'],
          preferred_vibes: ['small intimate groups'],
          dietary_needs: [],
          cultural_considerations: [],
          area: 'Carlton',
          social_energy: 'small intimate groups',
        },
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('posts the same { user_id, message, history } shape against /api/chat/onboarding', async () => {
    await sendOnboardingMessage({
      userId: 7,
      messages: [
        { role: 'user', content: 'I am here for uni' },
        { role: 'assistant', content: 'what do you miss?' },
        { role: 'user', content: 'shared meals' },
      ],
    })

    expect(postSpy).toHaveBeenCalledWith('/api/chat/onboarding', {
      user_id: 7,
      message: 'shared meals',
      history: [
        { role: 'user', content: 'I am here for uni' },
        { role: 'assistant', content: 'what do you miss?' },
      ],
    })
  })

  it('passes the preferences field through when onboarding completes', async () => {
    const result = await sendOnboardingMessage({
      userId: 7,
      messages: [{ role: 'user', content: 'last' }],
    })

    expect(result.onboarding_complete).toBe(true)
    expect(result.preferences).toMatchObject({
      melbourne_reason: 'study',
      area: 'Carlton',
    })
  })
})

describe('mockChatReply (fallback)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns { response, suggested_event_ids } matching the real backend shape', async () => {
    const futureIso = new Date(Date.now() + 86_400_000).toISOString()
    vi.spyOn(api, 'get').mockResolvedValue({
      data: [
        { id: 1, title: 'BBQ', start_time: futureIso, location: { name: 'Park' } },
        { id: 2, title: 'Garden', start_time: futureIso, location: { name: 'Plot' } },
        { id: 3, title: 'Kitchen', start_time: futureIso, location: { name: 'Hall' } },
      ],
    })

    const result = await mockChatReply({
      messages: [{ role: 'user', content: 'yo' }],
    })

    expect(result).toHaveProperty('response')
    expect(result).not.toHaveProperty('message')
    expect(result.suggested_event_ids).toEqual([1, 2, 3])
    expect(result.response).toMatch(/\[EVENT:1\]/)
  })
})

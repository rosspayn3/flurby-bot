# Flurby v0.9.0 - The Best Bot <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->
- [Introduction](#introduction)
- [Features](#features)
- [Commands](#commands)


<a name="intro"></a>
## Introduction

Flurby is a Discord bot that I started working on in December 2020. He's a side project to experiment with JavaScript and Node.js, as well as to get some practice reading through API documentation. I used the Discord.js module to help with interacting with the Discord API.

We started making heavy use of Discord in the Spring '20 semester at UAFS when COVID-19 attacked, so I figured it would be a good time to start a project that was relevant and could possibly be of use to the computer science department. For now, Flurby lives in my personal Discord server with all my friends. Once I get enough features added and all the bugs sorted out, I may open him up to be invited to other servers.


<a name="features"></a>
## Features

Flurby has a small set of features at the moment.

- Give magic 8-ball answers
- Fetch GIFs according to keyword(s) using the Tenor API
- Maintain a music playlist for playback in voice channels when users provide YouTube/YouTube Music URLs
  
I'll continue to add more as I learn about the Discord API and webhooks.


<a name="commands"></a>
## Commands

Command	| Arguments | Details
:---|:---|:---
!commands | (none) | Lists Flurby's available commands.
!8ball | <p>(optional)</p>a question | Go ahead. Shake it. You may not like Flurby's answer...
!gif | <p>(optional)</p>keyword(s) | Flurby gets a random GIF for you using the given keyword(s). If no keyword(s) are given, he picks one of his favorites.
!play | <p>YouTube URL</p><p>YouTube Music URL</p> | <p>Adds the URL to Flurby's playlist.</p><p>If he's not already playing music, he joins your voice channel to play music. Only one channel can be used at a time.</p>
!playlist | (none) | Shows all songs currently in the server's queue.
!roll | <p>(optional)</p><p>max range</p><p># of dice</p> | Rolls a number between 1-100 by default. If a number X is given, the roll will be up to and including that number (1 - X). Number of dice can also be specified as a second parameter.
<script setup>
import SectorBox from './components/SectorBox.vue';
</script>

<template>
  <section id="app">
    <div id="game-header">Occupy v0.0</div>
    <div class="container">
        <div class="column">
            <div class="team-header blue" :class="{'turn-indicator': 'playerOne.isTurn' }">Blue</div>
            <div>Settlers: {{ 'playerOne.settlers' }}</div>
            <div>Sectors: {{ 'playerOne.ownedSectors' }}</div>
        </div>
        <div class="column">
            <div>
                <div class="grid-container">
                    <SectorBox v-for="num in 25"></SectorBox>
                </div>
            </div>
            <div>game message</div>
            <div>game actions</div>
            <div>
                <button @click="createNewGame">New Game</button>
                <button @click="manageTurn">Toggle Turn</button>
            </div>
        </div>
        <div class="column">
            <div class="team-header red" :class="{'turn-indicator': 'playerTwo.isTurn '}">Red</div>
            <div>Settlers: {{ 'playerTwo.settlers' }}</div>
            <div>Sectors: {{ 'playerTwo.ownedSectors' }}</div>
        </div>
    </div>
  </section>
</template>

<style scoped>

</style>

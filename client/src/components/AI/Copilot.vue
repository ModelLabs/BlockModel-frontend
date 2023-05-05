<template>
    <div>
        <div class="tag-selection">
            <h3 class="select-title">Select tags</h3>
            <div class="select-type">
                <h4 class="tag-title">Project Type</h4>
                <el-tag :key="tag.index" v-for="tag in typeTags" :class="!tag.active ? 'type' : 'typeSelect'"
                    @click="select(tag)">
                    {{ tag.name }}
                </el-tag>
                <el-input class="input-new-tag" v-if="typeInputVisible" v-model="typeInputValue" ref="saveTypeTagInput"
                    size="small" @keyup.enter="handleTypeInputConfirm" @blur="handleTypeInputConfirm">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showTypeInput">+ New Tag</el-button>
            </div>

            <div class="select-token-kind">
                <h4 class="tag-title">Token System</h4>
                <el-tag :key="tag.index" v-for="tag in tokenKindTags" :class="!tag.active ? 'tokenKind' : 'tokenKindSelect'"
                    @click="selectToken(tag)">
                    {{ tag.name }}
                </el-tag>
            </div>
        </div>
        <div class="token-tag" v-if="editableTabs.length">
            <el-tabs v-model="editableTabsValue" type="card" @tab-click="tabClickFunc">
                <el-tab-pane
                v-for="item in editableTabs"
                :key="item.name"
                :label="item.title"
                :name="item.name"
                >
                    <div v-if="item.content === 'one'">
                        <div class="select-goal general">
                            <h4 class="tag-title">Goal</h4>
                            <el-tag :key="tag.index" v-for="tag in tokenTags.one.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                @click="select(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                        </div>

                        <div class="select-capabilities general">
                            <h4 class="tag-title">Capabilities</h4>
                            <el-tag :key="tag.index" v-for="tag in tokenTags.one.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                @click="select(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                        </div>

                        <div class="select-velocity general">
                            <h4 class="tag-title">Token Velocity</h4>
                            <el-tag :key="tag.index" v-for="tag in tokenTags.one.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                @click="selectVel(item.content,item.name,tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                        </div>

                        <div class="select-distributions-targets general">
                            <h4 class="tag-title">Token Distributions Targets</h4>
                            <el-tag :key="tag.index" v-for="tag in tokenTags.one.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                @click="select(tag)">
                                {{ tag.name }}
                            </el-tag>
                            <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                            </el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                        </div>
                    </div>
                    <div v-if="item.content === 'two'">
                        <div v-if="item.name === 'firstToken'">
                            <div class="select-goal general">
                                <h4 class="tag-title">Goal</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.firstToken.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                    size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                            </div>

                            <div class="select-capabilities general">
                                <h4 class="tag-title">Capabilities</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.firstToken.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                    size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                            </div>

                            <div class="select-velocity general">
                                <h4 class="tag-title">Token Velocity</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.firstToken.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                    @click="selectVel(item.content,item.name,tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                    size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                            </div>

                            <div class="select-distributions-targets general">
                                <h4 class="tag-title">Token Distributions Targets</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.firstToken.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                    size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                            </div>
                        </div>
                        <div v-else>
                            <div class="select-goal general">
                                <h4 class="tag-title">Goal</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.secondToken.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                    size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                            </div>

                            <div class="select-capabilities general">
                                <h4 class="tag-title">Capabilities</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.secondToken.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                    size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                            </div>

                            <div class="select-velocity general">
                                <h4 class="tag-title">Token Velocity</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.secondToken.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                    @click="selectVel(item.content,item.name,tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                    size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                            </div>

                            <div class="select-distributions-targets general">
                                <h4 class="tag-title">Token Distributions Targets</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.two.secondToken.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                    size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                            </div>
                        </div>
                    </div>

                    <div v-if="item.content === 'three'">
                        <div v-if="item.name === 'firstToken'">
                            <div class="select-goal general">
                                <h4 class="tag-title">Goal</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.firstToken.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                    size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                            </div>

                            <div class="select-capabilities general">
                                <h4 class="tag-title">Capabilities</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.firstToken.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                    size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                            </div>

                            <div class="select-velocity general">
                                <h4 class="tag-title">Token Velocity</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.firstToken.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                    @click="selectVel(item.content,item.name,tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                    size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                            </div>

                            <div class="select-distributions-targets general">
                                <h4 class="tag-title">Token Distributions Targets</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.firstToken.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                    size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                            </div>
                        </div>

                        <div v-else-if="item.name === 'secondToken'">
                            <div class="select-goal general">
                                <h4 class="tag-title">Goal</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.secondToken.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                    size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                            </div>

                            <div class="select-capabilities general">
                                <h4 class="tag-title">Capabilities</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.secondToken.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                    size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                            </div>

                            <div class="select-velocity general">
                                <h4 class="tag-title">Token Velocity</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.secondToken.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                    @click="selectVel(item.content,item.name,tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                    size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                            </div>

                            <div class="select-distributions-targets general">
                                <h4 class="tag-title">Token Distributions Targets</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.secondToken.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                    size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                            </div>
                        </div>

                        <div v-else>
                            <div class="select-goal general">
                                <h4 class="tag-title">Goal</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.thirdToken.goalTags" :class="!tag.active ? 'goal' : 'goalSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="goalInputVisible" v-model="goalInputValue"
                                    size="small" @keyup.enter="handleGoalInputConfirm(item.content,item.name)" @blur="handleGoalInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showGoalInput">+ New Tag</el-button>
                            </div>

                            <div class="select-capabilities general">
                                <h4 class="tag-title">Capabilities</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.thirdToken.capabilitiesTags" :class="!tag.active ? 'capabilities' : 'capabilitiesSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="capInputVisible" v-model="capInputValue"
                                    size="small" @keyup.enter="handleCapInputConfirm(item.content,item.name)" @blur="handleCapInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showCapInput">+ New Tag</el-button>
                            </div>

                            <div class="select-velocity general">
                                <h4 class="tag-title">Token Velocity</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.thirdToken.velocityTags" :class="!tag.active ? 'velocity' : 'velocitySelect'"
                                    @click="selectVel(item.content,item.name,tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="velInputVisible" v-model="velInputValue"
                                    size="small" @keyup.enter="handleVelInputConfirm(item.content,item.name)" @blur="handleVelInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showVelInput">+ New Tag</el-button>
                            </div>

                            <div class="select-distributions-targets general">
                                <h4 class="tag-title">Token Distributions Targets</h4>
                                <el-tag :key="tag.index" v-for="tag in tokenTags.three.thirdToken.distributionsTargetsTags" :class="!tag.active ? 'distributionsTargets' : 'distributionsTargetsSelect'"
                                    @click="select(tag)">
                                    {{ tag.name }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="dtInputVisible" v-model="dtInputValue"
                                    size="small" @keyup.enter="handleDTInputConfirm(item.content,item.name)" @blur="handleDTInputConfirm(item.content,item.name)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showDTInput">+ New Tag</el-button>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <el-button round class="btn" @click="btnClick" v-loading="showLoading">
            <span class="text">Complete, design a tokenomic for me ~!</span>
        </el-button>

        <div class="loading" v-if="showLoading">
            <span>
                <i class="el-icon-loading"></i>
                Please wait, I'm working hard to design for you.
            </span>
        </div>

        <div class="communication" v-if="showChat">
            <ul v-for="(item, index) in msglist" :key="index">
                <div class="ai-answer" v-if="!item.user">
                <AIPart :id="item.id" :drawChart="item.drawChart" :AIcontent="item.content" :piedata="item.piedata" :lineData="item.linedata" />
                </div>
                <div class="user-msg" v-else>
                <UserPart :id="item.id" :Usercontent="item.content" />
                </div>
                <!-- <RightItem :id="item.id" :type="item.type" :content="item.content" v-if="item.me"></RightItem>
                            <LeftItem :id="item.id" :type="item.type" :content="item.content" v-else></LeftItem>
                            <div v-scroll style="height: 0"></div> -->
            </ul>
            <!-- <div class="ai-answer">
                    <AIPart :AIcontent="AIcontent" :piedata="tmpPieChartData" :lineData="tmpLineChartData"/>
                </div>
                <div class="user-msg">
                    <UserPart :Usercontent="Usercontent" />
                </div> -->
        </div>

        <div class="input" v-if="showInput">
            <el-input
                placeholder="If you have any comments on the adjustment of the tokenomic we have designed, please enter it here and click the Send button."
                v-model="sendValue">
                <el-button slot="append" @click="onSubmit">Send</el-button>
            </el-input>
        </div>
    </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import UserPart from './UserPart.vue'
import AIPart from './AIPart.vue'
import { percentageToNumber, checkSumObj, checkSumArray, getRandomInt} from "../../utils/numberUtil";

var d3 = require("d3-interpolate");
//import { log } from '@antv/g2plot/lib/utils';
// import { Configuration, OpenAIApi } from "openai";
const schedule = require('node-schedule');
// we can store callTime into indexeddb
var callTime = 5;
export default {
  data() {
    return {
      typeTags: [
        { name: 'DEX', active: false },
        { name: 'Game', active: false },
        { name: 'Lending', active: false },
        { name: 'Infrastructure', active: false }
      ],
      selectedTypeTag: "", 

      tokenKindTags: [
        { name: 'One-Token', active: false },
        { name: 'Two-Token', active: false },
        { name: 'Three-Token', active: false }
      ],
      selectedTokenKindTag: "",

      typeInputVisible: false,
      typeInputValue: '',

      editableTabsValue: "firstToken",
      editableTabs: [],

      // token tags:
      tokenTags:{
        one:{
          goalTags: [
            { name: 'Incentive to Use', active: false },
            { name: 'Incentive to Hold', active: false },
            { name: 'Incentive to Vote', active: false },
            { name: 'Incentive to Increase Liquidity', active: false },
            { name: 'Incentive Trading Activity', active: false },
            { name: 'Reduce Volatility', active: false },
          ],
          capabilitiesTags: [
            { name: 'Payment', active: false },
            { name: 'Vote', active: false },
            { name: 'Secure Network', active: false },
            { name: 'Exchange', active: false },
            { name: 'Access to Service', active: false },
          ],
          velocityTags: [
            { name: 'Slow', active: false },
            { name: 'Medium', active: false },
            { name: 'Fast', active: false },
          ],
          distributionsTargetsTags: [
            { name: 'Airdrop', active: false },
            { name: 'Private_investor', active: false },
            { name: 'Public_sale', active: false },
            { name: 'Liquidity_mining', active: false },
            { name: 'Team', active: false },
            { name: 'Foundation', active: false },
            { name: 'Advisor', active: false },
          ],
        },
        two:{
          firstToken:{
            goalTags: [
              { name: 'Incentive to Use', active: false },
              { name: 'Incentive to Hold', active: false },
              { name: 'Incentive to Vote', active: false },
              { name: 'Incentive to Increase Liquidity', active: false },
              { name: 'Incentive Trading Activity', active: false },
              { name: 'Reduce Volatility', active: false },
            ],
            capabilitiesTags: [
              { name: 'Payment', active: false },
              { name: 'Vote', active: false },
              { name: 'Secure Network', active: false },
              { name: 'Exchange', active: false },
              { name: 'Access to Service', active: false },
            ],
            velocityTags: [
              { name: 'Slow', active: false },
              { name: 'Medium', active: false },
              { name: 'Fast', active: false },
            ],
            distributionsTargetsTags: [
              { name: 'Airdrop', active: false },
              { name: 'Private_investor', active: false },
              { name: 'Public_sale', active: false },
              { name: 'Liquidity_mining', active: false },
              { name: 'Team', active: false },
              { name: 'Foundation', active: false },
              { name: 'Advisor', active: false },
            ],
          },
          secondToken:{
              goalTags: [
              { name: 'Incentive to Use', active: false },
              { name: 'Incentive to Hold', active: false },
              { name: 'Incentive to Vote', active: false },
              { name: 'Incentive to Increase Liquidity', active: false },
              { name: 'Incentive Trading Activity', active: false },
              { name: 'Reduce Volatility', active: false },
            ],
            capabilitiesTags: [
              { name: 'Payment', active: false },
              { name: 'Vote', active: false },
              { name: 'Secure Network', active: false },
              { name: 'Exchange', active: false },
              { name: 'Access to Service', active: false },
            ],
            velocityTags: [
              { name: 'Slow', active: false },
              { name: 'Medium', active: false },
              { name: 'Fast', active: false },
            ],
            distributionsTargetsTags: [
              { name: 'Airdrop', active: false },
              { name: 'Private_investor', active: false },
              { name: 'Public_sale', active: false },
              { name: 'Liquidity_mining', active: false },
              { name: 'Team', active: false },
              { name: 'Foundation', active: false },
              { name: 'Advisor', active: false },
            ],
          }
        },
        three:{
          firstToken:{
            goalTags: [
              { name: 'Incentive to Use', active: false },
              { name: 'Incentive to Hold', active: false },
              { name: 'Incentive to Vote', active: false },
              { name: 'Incentive to Increase Liquidity', active: false },
              { name: 'Incentive Trading Activity', active: false },
              { name: 'Reduce Volatility', active: false },
            ],
            capabilitiesTags: [
              { name: 'Payment', active: false },
              { name: 'Vote', active: false },
              { name: 'Secure Network', active: false },
              { name: 'Exchange', active: false },
              { name: 'Access to Service', active: false },
            ],
            velocityTags: [
              { name: 'Slow', active: false },
              { name: 'Medium', active: false },
              { name: 'Fast', active: false },
            ],
            distributionsTargetsTags: [
              { name: 'Airdrop', active: false },
              { name: 'Private_investor', active: false },
              { name: 'Public_sale', active: false },
              { name: 'Liquidity_mining', active: false },
              { name: 'Team', active: false },
              { name: 'Foundation', active: false },
              { name: 'Advisor', active: false },
            ],
          },
          secondToken:{
            goalTags: [
              { name: 'Incentive to Use', active: false },
              { name: 'Incentive to Hold', active: false },
              { name: 'Incentive to Vote', active: false },
              { name: 'Incentive to Increase Liquidity', active: false },
              { name: 'Incentive Trading Activity', active: false },
              { name: 'Reduce Volatility', active: false },
            ],
            capabilitiesTags: [
              { name: 'Payment', active: false },
              { name: 'Vote', active: false },
              { name: 'Secure Network', active: false },
              { name: 'Exchange', active: false },
              { name: 'Access to Service', active: false },
            ],
            velocityTags: [
              { name: 'Slow', active: false },
              { name: 'Medium', active: false },
              { name: 'Fast', active: false },
            ],
            distributionsTargetsTags: [
              { name: 'Airdrop', active: false },
              { name: 'Private_investor', active: false },
              { name: 'Public_sale', active: false },
              { name: 'Liquidity_mining', active: false },
              { name: 'Team', active: false },
              { name: 'Foundation', active: false },
              { name: 'Advisor', active: false },
            ],
          },
          thirdToken:{
            goalTags: [
              { name: 'Incentive to Use', active: false },
              { name: 'Incentive to Hold', active: false },
              { name: 'Incentive to Vote', active: false },
              { name: 'Incentive to Increase Liquidity', active: false },
              { name: 'Incentive Trading Activity', active: false },
              { name: 'Reduce Volatility', active: false },
            ],
            capabilitiesTags: [
              { name: 'Payment', active: false },
              { name: 'Vote', active: false },
              { name: 'Secure Network', active: false },
              { name: 'Exchange', active: false },
              { name: 'Access to Service', active: false },
            ],
            velocityTags: [
              { name: 'Slow', active: false },
              { name: 'Medium', active: false },
              { name: 'Fast', active: false },
            ],
            distributionsTargetsTags: [
              { name: 'Airdrop', active: false },
              { name: 'Private_investor', active: false },
              { name: 'Public_sale', active: false },
              { name: 'Liquidity_mining', active: false },
              { name: 'Team', active: false },
              { name: 'Foundation', active: false },
              { name: 'Advisor', active: false },
            ],
          }
        },
      },
      goalInputVisible: false,
      goalInputValue: '',
      capInputVisible: false,
      capInputValue: '',
      velInputVisible: false,
      velInputValue: '',
      dtInputVisible: false,
      dtInputValue: '',

      showLoading: false,
      showChat: false,
      showInput: false,

      msglist: [],
      sendValue: '',

      LineChartData: [],
      PieChartData: [],

      questions: new Array(),

      selectedAPIKey: "",

      tokenSymbol: "",
      tokenSupply: "",
      dynamicValidateForm: {
        stakeholders:[
          
        ]
      },
      visualSettingVisible: false,
      selectedPolicyIndex: 0,

      drawer: false,
    };
  },
  components: {
    AIPart,
    UserPart,
  },
  watch:{
    msglist:{
      handler(){
        if(this.msglist[this.msglist.length-1].user === false){
          this.showLoading = false;
        }
      }
    }
  },
  methods: {
    async onSubmit() {
      this.showLoading = true;
      //event.preventDefault();
      try {
        this.msglist.push(
          {
            content: this.sendValue,
            user: true,
            drawChart: false,
            piedata: null,
            linedata: null,
          }
        );
        let systemMessage = "Remember you are a Web3 token economy engineer. You should answer questions based on what you have designed previously.";
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.selectedAPIKey
          },
          body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            'messages': [
              {"role": "system", "content": systemMessage},
              {"role": "user", "content": this.sendValue},
            ],
            'temperature': 0.2,
          })
        };

        if (callTime > 0) {
          const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions)
          if (response.status == 200) {
            const data = await response.json();
            //  Do something with data
            console.log("reply data:", data);
            let replyContent = data.choices[0].message.content

            this.msglist.push(
              {
                content: replyContent,
                user: false,
                drawChart: false,
                piedata: null,
                linedata: null,
              }
            );
            
            callTime = callTime - 1;
          } else {
            alert("response status error, please call again");
          }
            
        } else {
          alert("Visitor can only call five times");
        }

      } catch (error) {
        // Consider implementing your own error handling logic here
        alert("api error, please call again: ", error);
      }
    },
    btnClick(){
      console.log("user:", this.user, ", user_email:", this.userEmail);
      if (this.user != null && this.userEmail != null) {
        this.showLoading = true;
        this.showChat = false;
        this.showInput = false;

        // 清理全局变量数据
        this.questions = new Array();
        this.selectedTypeTag = "";
        this.selectedTokenKindTag = "";

            // 只有一种 token && 第一个 token
        let goalTag = "", capabilitiesTag = "", velocityTag = "", distributionsTargetsTag = "",
            // 两种 token，第一个 && 第二个 F:first S:second
            twoFgoalTag = "", twoFcapabilitiesTag = "", twoFvelocityTag = "", twoFdistributionsTargetsTag = "",
            twoSgoalTag = "", twoScapabilitiesTag = "", twoSvelocityTag = "", twoSdistributionsTargetsTag = "",
            // 三种 token，第一个 && 第二个 && 第三个 F:first S:second T:third
            threeFgoalTag = "", threeFcapabilitiesTag = "", threeFvelocityTag = "", threeFdistributionsTargetsTag = "",
            threeSgoalTag = "", threeScapabilitiesTag = "", threeSvelocityTag = "", threeSdistributionsTargetsTag = "",
            threeTgoalTag = "", threeTcapabilitiesTag = "", threeTvelocityTag = "", threeTdistributionsTargetsTag = "";

        for (var val in this.typeTags) {
          if (this.typeTags[val].active) {
            this.selectedTypeTag = this.selectedTypeTag + this.typeTags[val].name + ',';
          }
        }
        if (this.selectedTypeTag == "") {
          this.$message({
            showClose: true,
            message: 'Please select at least one tag of your project type',
            type: 'error'
          });
        }

        for (val in this.tokenKindTags) {
          if (this.tokenKindTags[val].active) {
            this.selectedTokenKindTag = this.tokenKindTags[val].name;
          }
        }
        if (this.selectedTokenKindTag == "") {
          this.$message({
            showClose: true,
            message: 'Please select at least one tag of your token system',
            type: 'error'
          });
        }

        switch(this.selectedTokenKindTag){
          case "":
            this.$message({
              showClose: true,
              message: 'Please select at least one tag of each category',
              type: 'error'
            });
            break;
          case "One-Token":
            for (val in this.tokenTags.one.goalTags) {
              if (this.tokenTags.one.goalTags[val].active) {
                goalTag = goalTag + this.tokenTags.one.goalTags[val].name + ',';
              }
            }
            for (val in this.tokenTags.one.capabilitiesTags) {
              if (this.tokenTags.one.capabilitiesTags[val].active) {
                capabilitiesTag = capabilitiesTag + this.tokenTags.one.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.one.velocityTags) {
              if (this.tokenTags.one.velocityTags[val].active) {
                velocityTag = velocityTag + this.tokenTags.one.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.one.distributionsTargetsTags) {
              if (this.tokenTags.one.distributionsTargetsTags[val].active) {
                distributionsTargetsTag = distributionsTargetsTag + this.tokenTags.one.distributionsTargetsTags[val].name + ',';
              }
            }
            if(goalTag === "" | capabilitiesTag === "" | velocityTag === "" | distributionsTargetsTag === "") {
              this.$message({
                showClose: true,
                message: 'Please select at least one tag of each category',
                type: 'error'
              });
            }
            // 组装语句
            else {
              let question = 'The goal of this token is ['+ goalTag +']. Its capability includes ['+ capabilitiesTag + ']. Its Token Distribution Targets have ['+ distributionsTargetsTag + ']. The Token Velocity should be [' + velocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question);
            }
            break;
          case "Two-Token":
            for (val in this.tokenTags.two.firstToken.goalTags) {
              if (this.tokenTags.two.firstToken.goalTags[val].active) {
                twoFgoalTag = twoFgoalTag + this.tokenTags.two.firstToken.goalTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.two.firstToken.capabilitiesTags) {
              if (this.tokenTags.two.firstToken.capabilitiesTags[val].active) {
                twoFcapabilitiesTag = twoFcapabilitiesTag + this.tokenTags.two.firstToken.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.two.firstToken.velocityTags) {
              if (this.tokenTags.two.firstToken.velocityTags[val].active) {
                twoFvelocityTag = twoFvelocityTag + this.tokenTags.two.firstToken.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.two.firstToken.distributionsTargetsTags) {
              if (this.tokenTags.two.firstToken.distributionsTargetsTags[val].active) {
                twoFdistributionsTargetsTag = twoFdistributionsTargetsTag + this.tokenTags.two.firstToken.distributionsTargetsTags[val].name + ',';
              }
            }
            //
            for (val in this.tokenTags.two.secondToken.goalTags) {
              if (this.tokenTags.two.secondToken.goalTags[val].active) {
                twoSgoalTag = twoSgoalTag + this.tokenTags.two.secondToken.goalTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.two.secondToken.capabilitiesTags) {
              if (this.tokenTags.two.secondToken.capabilitiesTags[val].active) {
                twoScapabilitiesTag = twoScapabilitiesTag + this.tokenTags.two.secondToken.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.two.secondToken.velocityTags) {
              if (this.tokenTags.two.secondToken.velocityTags[val].active) {
                twoSvelocityTag = twoSvelocityTag + this.tokenTags.two.secondToken.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.two.secondToken.distributionsTargetsTags) {
              if (this.tokenTags.two.secondToken.distributionsTargetsTags[val].active) {
                twoSdistributionsTargetsTag = twoSdistributionsTargetsTag + this.tokenTags.two.secondToken.distributionsTargetsTags[val].name + ',';
              }
            }

            if(twoFgoalTag === "" | twoFcapabilitiesTag === "" | twoFvelocityTag === "" | twoFdistributionsTargetsTag === "" |
              twoSgoalTag === "" | twoScapabilitiesTag === "" | twoSvelocityTag === "" | twoSdistributionsTargetsTag === ""
            ) {
              this.$message({
                showClose: true,
                message: 'Please select at least one tag of each category',
                type: 'error'
              });
            }
            // 组装语句 Continue
            else {
              let question1 = 'The goal of first token is ['+ twoFgoalTag +']. Its capability includes ['+ twoFcapabilitiesTag + ']. Its Token Distribution Targets have ['+ twoFdistributionsTargetsTag + ']. The Token Velocity should be [' + twoFvelocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question1);
              let question2 = 'The goal of second token is ['+ twoSgoalTag +']. Its capability includes ['+ twoScapabilitiesTag + ']. Its Token Distribution Targets have ['+ twoSdistributionsTargetsTag + ']. The Token Velocity should be [' + twoSvelocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question2);
            }
            break;
          case "Three-Token":
            for (val in this.tokenTags.three.firstToken.goalTags) {
              if (this.tokenTags.three.firstToken.goalTags[val].active) {
                threeFgoalTag = threeFgoalTag + this.tokenTags.three.firstToken.goalTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.firstToken.capabilitiesTags) {
              if (this.tokenTags.three.firstToken.capabilitiesTags[val].active) {
                threeFcapabilitiesTag = threeFcapabilitiesTag + this.tokenTags.three.firstToken.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.three.firstToken.velocityTags) {
              if (this.tokenTags.three.firstToken.velocityTags[val].active) {
                threeFvelocityTag = threeFvelocityTag + this.tokenTags.three.firstToken.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.firstToken.distributionsTargetsTags) {
              if (this.tokenTags.three.firstToken.distributionsTargetsTags[val].active) {
                threeFdistributionsTargetsTag = threeFdistributionsTargetsTag + this.tokenTags.three.firstToken.distributionsTargetsTags[val].name + ',';
              }
            }
            //
            for (val in this.tokenTags.three.secondToken.goalTags) {
              if (this.tokenTags.three.secondToken.goalTags[val].active) {
                threeSgoalTag = threeSgoalTag + this.tokenTags.three.secondToken.goalTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.secondToken.capabilitiesTags) {
              if (this.tokenTags.three.secondToken.capabilitiesTags[val].active) {
                threeScapabilitiesTag = threeScapabilitiesTag + this.tokenTags.three.secondToken.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.three.secondToken.velocityTags) {
              if (this.tokenTags.three.secondToken.velocityTags[val].active) {
                threeSvelocityTag = threeSvelocityTag + this.tokenTags.three.secondToken.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.secondToken.distributionsTargetsTags) {
              if (this.tokenTags.three.secondToken.distributionsTargetsTags[val].active) {
                threeSdistributionsTargetsTag = threeSdistributionsTargetsTag + this.tokenTags.three.secondToken.distributionsTargetsTags[val].name + ',';
              }
            }
            //
            for (val in this.tokenTags.three.thirdToken.goalTags) {
              if (this.tokenTags.three.thirdToken.goalTags[val].active) {
                threeTgoalTag = threeTgoalTag + this.tokenTags.three.thirdToken.goalTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.thirdToken.capabilitiesTags) {
              if (this.tokenTags.three.thirdToken.capabilitiesTags[val].active) {
                threeTcapabilitiesTag = threeTcapabilitiesTag + this.tokenTags.three.thirdToken.capabilitiesTags[val].name + ',';
              }
            }

            for (val in this.tokenTags.three.thirdToken.velocityTags) {
              if (this.tokenTags.three.thirdToken.velocityTags[val].active) {
                threeTvelocityTag = threeTvelocityTag + this.tokenTags.three.thirdToken.velocityTags[val].name + ',';
              }
            }
            
            for (val in this.tokenTags.three.thirdToken.distributionsTargetsTags) {
              if (this.tokenTags.three.thirdToken.distributionsTargetsTags[val].active) {
                threeTdistributionsTargetsTag = threeTdistributionsTargetsTag + this.tokenTags.three.thirdToken.distributionsTargetsTags[val].name + ',';
              }
            }
            if(threeFgoalTag === "" | threeFcapabilitiesTag === "" | threeFvelocityTag === "" | threeFdistributionsTargetsTag === "" |
              threeSgoalTag === "" | threeScapabilitiesTag === "" | threeSvelocityTag === "" | threeSdistributionsTargetsTag === "" |
              threeTgoalTag === "" | threeTcapabilitiesTag === "" | threeTvelocityTag === "" | threeTdistributionsTargetsTag === ""
            ) {
              this.$message({
                showClose: true,
                message: 'Please select at least one tag of each category',
                type: 'error'
              });
            }
            // 组装语句 Continue
            else {
              let question1 = 'The goal of first token is ['+ threeFgoalTag +']. Its capability includes ['+ threeFcapabilitiesTag + ']. Its Token Distribution Targets have ['+ threeFdistributionsTargetsTag + ']. The Token Velocity should be [' + threeFvelocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question1);
              let question2 = 'The goal of second token is ['+ threeSgoalTag +']. Its capability includes ['+ threeScapabilitiesTag + ']. Its Token Distribution Targets have ['+ threeSdistributionsTargetsTag + ']. The Token Velocity should be [' + threeSvelocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question2);
              let question3 = 'The goal of third token is ['+ threeTgoalTag +']. Its capability includes ['+ threeTcapabilitiesTag + ']. Its Token Distribution Targets have ['+ threeTdistributionsTargetsTag + ']. The Token Velocity should be [' + threeTvelocityTag + ']. Please answer the following questions in JSON format only, no preambles, explanations or caveats are required: (1) Please design Token\'s Basic Information, including token\'s symbol, token\'s initial supply and token\'s inflation rate. Please organize your reply in JSON format like " "basic_info" : {"symbol": "A", "initial_supply": 1000, "inflation": {"base_rate": 0.05, "min_rate": 0.02, "max_rate": 0.1}} ". (2) Please help me designing Target Allocation, which shows what percentage of total tokens that each distribution target can get. Please organize your data in JSON format like " "allocation": {"airdrop": "10%", ...} ". (3) Please help me designing a vesting schedule within [1825 days]. For each distribution target, it shows release cliff (in days), release frequency (in days), and percentage of tokens that will be released each time. Remember, for each target, the sum of all percentages should equal to 100%. Please organize your data in JSON format like " "vesting": [{"target": "liquidity_mining", “cliff”: “30”, “frequency”: “180”, “percentage”:[“10%”, ...]},…] ".'; 
              this.questions.push(question3);
            }
            break;
          default:
            break;
        }
        // TODO 如有漏选提示用户哪里漏选了

        this.design();
      }
      else {
        alert("Please log in with your wallet and email!");
      }
      
    },
    async design() {
      this.scheduleTask();
      // before calling to openai api, we should create a session between client and server
      // 1. retrive session from database with user_email
      let resultFromServer = await this.axios.get(`/api/session/${this.userEmail}`);
      let session = resultFromServer.data;
      console.log(session);
      if (session.length == 0) {
        console.log("no session, we will create a session between client and server!");
        resultFromServer = await this.axios.get('/api/apikey');
        let aipkey = resultFromServer.data;
        if (aipkey.length == 0) {
          alert("no apikey available!");
          this.showLoading = false;
          return
        } else {
          session = [{"_user":this.userEmail,"_apikey":aipkey[0]._apikey,"_createtime":Date.now(),"_calltimes":5}];
          console.log(session[0]);
          let result = await this.axios
        .post('/api/session', { _user: session[0]._user, _apikey: session[0]._apikey, _createtime: session[0]._createtime, _calltimes: session[0]._calltimes });
          console.log("create session result:"+result);
          result = await this.axios
        .put('/api/apikey', { apikey: session[0]._apikey, status: 1 });
          console.log("update apikey status result:"+result);
        }
      }
      // console.log(participantsTag.substring(0,participantsTag.lastIndexOf(',')));
      let systemMessage = 'I want you to act as a Web3 token economy engineer. I will provide some specific information about token requirement, and it will be your job to come up with detailed design for my product . Different requirements lead to different designs. I will tell you what track my product belongs to, and how many types of tokens I need, and some other requirements. Then you should give me the best appropriate design, based on your abundant knowledge of Tokenomics . In the design process, you need to use mathematics and statistics knowledge to avoid numerical calculation errors. Now I need you to help designing my ' + this.selectedTypeTag + ' project\'s ' + this.selectedTokenKindTag + '-token economy model. I will tell you my requirement for each type of token. Your design should satisfy my requirements and requests for each type of token. If you understand, just only reply \'understand\'';

      this.selectedAPIKey = String(session[0]._apikey);
      for (let ques = 0; ques < this.questions.length; ques++) {
        let messages = [];
        if (ques == 0) messages.push(
          { "role": "system", "content": systemMessage }
        );
        messages.push(
          { "role": "user", "content": this.questions[ques] }
        );

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.selectedAPIKey
          },
          body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            'messages': messages,
            'temperature': 0.2,
          })
        };
        if (session[0]._calltimes > 0) {
          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
            if (response.status == 200) {
              const data = await response.json();

              this.LineChartData = [];
              this.PieChartData = [];
              //  Do something with data
              let replyContent = data.choices[0].message.content
              console.log("reply data:", replyContent);

              // Using Regex to extract token's basic info from response, and turn it into Object
              let tokenBasicInfoRe = /"basic_info":\s*{\s*"symbol":\s*"(.*?)",\s*"initial_supply":\s*([0-9]+(.[0-9]+)?),\s*"inflation":\s*{\s*"base_rate":\s*([0-9]+(.[0-9]+)?),\s*"min_rate":\s*([0-9]+(.[0-9]+)?),\s*"max_rate":\s*([0-9]+(.[0-9]+)?)\s*\}\s*\}/;
              let tokenBasicInfo = replyContent.match(tokenBasicInfoRe);
              if (tokenBasicInfo == null || tokenBasicInfo == undefined || tokenBasicInfo.length < 1) throw "reply format error";
              else tokenBasicInfo = tokenBasicInfo[0];
              this.msglist.push(
                {
                //   content: 'My design for ' + tokenBasicInfo.symbol + ' is as follows: \n' + replyContent,
                  content: tokenBasicInfo,
                  user: false,
                  drawChart: false,
                  piedata: null,
                  linedata: null,
                }
              );
            //   tokenBasicInfo = JSON.parse("{" + tokenBasicInfo + "}").basic_info;

              // Using Regex to extract token's allocation info
              let tokenAllocationInfoRe = /"allocation"\s*:\s*{(?:\s*"[^"]+"\s*:\s*"[0-9]+%"\s*,?)*}/;
              let tokenAllocationInfo = replyContent.match(tokenAllocationInfoRe);
              if (tokenAllocationInfo == null || tokenAllocationInfo == undefined || tokenAllocationInfo.length < 1) throw "reply format error";
              else tokenAllocationInfo = tokenAllocationInfo[0];
              this.msglist.push(
                {
                //   content: 'My design for ' + tokenBasicInfo.symbol + ' is as follows: \n' + replyContent,
                  content: tokenAllocationInfo,
                  user: false,
                  drawChart: false,
                  piedata: null,
                  linedata: null,
                }
              );
            //   tokenAllocationInfo = JSON.parse("{" + tokenAllocationInfo + "}").allocation;
            //   if (!checkSumObj(tokenAllocationInfo)) {
            //     throw ("mathmatics error");
            //   }

              // Using Regex to extract token's vesting info
              let tokenVestingInfoRe = /"vesting":\s*\[(?:\s*\{(?:[^{}]|R)*\}\s*,?)+\s*\]/;
              let tokenVestingInfo = replyContent.match(tokenVestingInfoRe);
              if (tokenVestingInfo == null || tokenVestingInfo == undefined || tokenVestingInfo.length < 1) throw "reply format error";
              else tokenVestingInfo = tokenVestingInfo[0];
              this.msglist.push(
                {
                //   content: 'My design for ' + tokenBasicInfo.symbol + ' is as follows: \n' + replyContent,
                  content: tokenVestingInfo,
                  user: false,
                  drawChart: false,
                  piedata: null,
                  linedata: null,
                }
              );
            //   tokenVestingInfo = JSON.parse("{" + tokenVestingInfo + "}").vesting;
            //   for (var i in tokenVestingInfo) {
            //     if (!checkSumArray(tokenVestingInfo[i].percentage)) {
            //       throw ("mathmatics error");
            //     }
            //   }

            //   this.packDataForVisualization(tokenBasicInfo, tokenAllocationInfo, tokenVestingInfo);



              // var jsonParesed = JSON.parse(tmpData);
              // if (!this.checkSum(jsonParesed.allocation)) {
              //   alert("error occured while check sum, please call again");
              // }
              session[0]._calltimes = session[0]._calltimes - 1;
              let res = await this.axios.put('/api/session', {user: session[0]._user, calltimes: session[0]._calltimes});
              console.log("update sesiion result: "+res);
            //   this.msglist.push(
            //     {
            //     //   content: 'My design for ' + tokenBasicInfo.symbol + ' is as follows: \n' + replyContent,
            //       content: replyContent,
            //       user: false,
            //       drawChart: false,
            //       piedata: JSON.parse(JSON.stringify(this.PieChartData)),
            //       linedata: JSON.parse(JSON.stringify(this.LineChartData)),
            //     }
            //   );

              this.showChat = true;
              this.showInput = true;
            }
            else {
              throw ("response status error");
            }
          } catch (err) {
            alert("api error, please call again: " + err);
          }

        } else {
          alert("Visitor can only call five times");
        }
      }
      this.showLoading = false;
    },
    
    // query availabel apikey from database
    retrieveAPIkey() {
      this.axios.get('/api/apikey').then(
        result => {
          console.log(result.data);
          // do something
          return result.data;
        },
        error => {
          console.error(error);
          return null;
        }
      )
    },
    // udate apikey status
    // value example: var values={"apikey":"xxxx", "status": 1/0}
    updateAPIkeyStatus(values) {
      this.axios
        .put('/api/apikey', { apikey: values.apikey, status: values.status })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    // create session between user and server
    //  values example: var values={"_user":"0x123","_apikey":"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","_createtime":"1680283006","_calltims":5}
    createSession(value) {
      this.axios
        .post('/api/session', { _user: value.user, _apikey: value.apikey, _createtime: Date.now(), _calltime: 5 })
        .then(res => {
          console.log(res);
          return res;
        })
        .catch(err => {
          console.log(err)
          return err
        })
    },
    // query session
    // user example: var user = '0x123';
    retrieveSession(user) {
      this.axios.get(`/api/session/${user}`).then(
        result => {
          console.log(result.data)
          // do something
          return result.data
        },
        error => {
          console.error(error)
          return null
        }
      )
    },
    // update session
    // user example: var values = {"user":"xxxxx@163.com","calltimes":4};
    updateSession(values) {
      this.axios.put('/api/session', {user: values.user, calltimes: values.calltimes}).then(
        result => {
          console.log(result.data)
          // do something
          return result.data
        },
        error => {
          console.error(error)
          return null
        }
      )
    },
    // end session
    // user example: var user = '0x123';
    endSession(user) {
      this.axios
        .delete(`/api/session/${user}`)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    sendMail(toAddress) {
      this.axios
      .get(`/api/send/${toAddress}`)
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    },
    // example var values= {"user":xxx@xxx.com,"code":"012436"}
    verifyAuthcode(values) {
      this.axios
      .post('/api/authcode',values)
      .then(res => {
          console.log(res);
        })
      .catch(err => {
          console.log(err)
        })
    },
    scheduleTask() {
      const scheduleCronstyle = () => {
        //: schedule task will be executed every 15 minutes
        schedule.scheduleJob('*/15 * * * *', () => {
          console.log('scheduleCronstyle:' + new Date());
          // call endsession interface to end session, arguement 'user' should be passed
          this.endSession(this.userEmail);

          this.updateAPIkeyStatus({"apikey": this.selectedAPIKey, "status": 0});
        });
      }
      scheduleCronstyle();
    },
    select(tag) {
      tag.active = !tag.active;
    },
    selectToken(tag) {
      this.editableTabs = [];

      // 只能单选
      if(tag.active) {
        tag.active = !tag.active;
      }
      else {
        for(let i=0;i<this.tokenKindTags.length;i++){
          if(this.tokenKindTags[i].name === tag.name) this.tokenKindTags[i].active = true;
          else this.tokenKindTags[i].active = false;
        }
        // 按 token 数量生成新的选择 div
        switch(tag.name){
          case "One-Token":
            this.editableTabs.push({
              title:"First Token",
              name:'firstToken',
              content:"one"
            });
            break;
          case "Two-Token":
            this.editableTabs.push({
              title:"First Token",
              name:'firstToken',
              content:"two"
            });
            this.editableTabs.push({
              title:"Second Token",
              name:'secondToken',
              content:"two"
            });
            break;
          case "Three-Token":
            this.editableTabs.push({
              title:"First Token",
              name:'firstToken',
              content:"three"
            });
            this.editableTabs.push({
              title:"Second Token",
              name:'secondToken',
              content:"three"
            });
            this.editableTabs.push({
              title:"Third Token",
              name:'thirdToken',
              content:"three"
            });
            break;
          default:
            break;
        }
      }
    },
    selectVel(tokenNum,index,tag) {
      if(tag.active) tag.active = !tag.active;
      else{
        if(tokenNum === "one"){
          for(let i=0;i<this.tokenTags.one.velocityTags.length;i++){
            if(this.tokenTags.one.velocityTags[i].name === tag.name) this.tokenTags.one.velocityTags[i].active = true;
            else this.tokenTags.one.velocityTags[i].active = false;
          }
        }
        else if(tokenNum === "two"){
          if(index==="firstToken"){
            for(let i=0;i<this.tokenTags.two.firstToken.velocityTags.length;i++){
              if(this.tokenTags.two.firstToken.velocityTags[i].name === tag.name) this.tokenTags.two.firstToken.velocityTags[i].active = true;
              else this.tokenTags.two.firstToken.velocityTags[i].active = false;
            }
          }
          else {
            for(let i=0;i<this.tokenTags.two.secondToken.velocityTags.length;i++){
              if(this.tokenTags.two.secondToken.velocityTags[i].name === tag.name) this.tokenTags.two.secondToken.velocityTags[i].active = true;
              else this.tokenTags.two.secondToken.velocityTags[i].active = false;
            }
          }
          
        }
        else {
          if(index==="firstToken"){
            for(let i=0;i<this.tokenTags.three.firstToken.velocityTags.length;i++){
              if(this.tokenTags.three.firstToken.velocityTags[i].name === tag.name) this.tokenTags.three.firstToken.velocityTags[i].active = true;
              else this.tokenTags.three.firstToken.velocityTags[i].active = false;
            }
          }
          else if(index==="secondToken"){
            for(let i=0;i<this.tokenTags.three.secondToken.velocityTags.length;i++){
              if(this.tokenTags.three.secondToken.velocityTags[i].name === tag.name) this.tokenTags.three.secondToken.velocityTags[i].active = true;
              else this.tokenTags.three.secondToken.velocityTags[i].active = false;
            }
          }
          else {
            
            for(let i=0;i<this.tokenTags.three.thirdToken.velocityTags.length;i++){
              if(this.tokenTags.three.thirdToken.velocityTags[i].name === tag.name) this.tokenTags.three.thirdToken.velocityTags[i].active = true;
              else this.tokenTags.three.thirdToken.velocityTags[i].active = false;
            }
          }
          
        }
        
      }
    },
    tabClickFunc(){},
    showTypeInput() {
      this.typeInputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTypeTagInput.$refs.input.focus();
      });
    },
    showGoalInput(){
      this.goalInputVisible = true;
    },
    showCapInput(){
      this.capInputVisible = true;
    },
    showVelInput(){
      this.velInputVisible = true;
    },
    showDTInput(){
      this.dtInputVisible = true;
    },
    handleTypeInputConfirm() {
      let inputValue = this.typeInputValue;
      if (inputValue) {
        this.typeTags.push({ name: inputValue, active: false });
      }
      this.typeInputVisible = false;
      this.typeInputValue = '';
    },
    handleGoalInputConfirm(val,index) {
      let inputValue = this.goalInputValue;
      if (inputValue) {
        if(val==="one")
        this.tokenTags.one.goalTags.push({ name: inputValue, active: false });
        if(val==="two"){
          if(index==='firstToken') this.tokenTags.two.firstToken.goalTags.push({ name: inputValue, active: false });
          else this.tokenTags.two.secondToken.goalTags.push({ name: inputValue, active: false });
        }
        else {
          if(index==='firstToken') this.tokenTags.three.firstToken.goalTags.push({ name: inputValue, active: false });
          else if(index==='secondToken') this.tokenTags.three.secondToken.goalTags.push({ name: inputValue, active: false });
          else this.tokenTags.three.thirdToken.goalTags.push({ name: inputValue, active: false });
        }
      }
      this.goalInputVisible = false;
      this.goalInputValue = '';
    },
  
    handleCapInputConfirm(val,index){
      let inputValue = this.capInputValue;
      if (inputValue) {
        if(val==="one")
        this.tokenTags.one.capabilitiesTags.push({ name: inputValue, active: false });
        if(val==="two"){
          if(index==='firstToken') this.tokenTags.two.firstToken.capabilitiesTags.push({ name: inputValue, active: false });
          else this.tokenTags.two.secondToken.capabilitiesTags.push({ name: inputValue, active: false });
        }
        else{
          if(index==='firstToken') this.tokenTags.three.firstToken.capabilitiesTags.push({ name: inputValue, active: false });
          else if(index==='secondToken') this.tokenTags.three.secondToken.capabilitiesTags.push({ name: inputValue, active: false });
          else this.tokenTags.three.thirdToken.capabilitiesTags.push({ name: inputValue, active: false });
        }
      }
      this.capInputVisible = false;
      this.capInputValue = '';
    },
    handleVelInputConfirm(val,index){
      let inputValue = this.velInputValue;
      if (inputValue) {
        if(val==="one")
        this.tokenTags.one.velocityTags.push({ name: inputValue, active: false });
        if(val==="two") {
          if(index==='firstToken') this.tokenTags.two.firstToken.velocityTags.push({ name: inputValue, active: false });
          else this.tokenTags.two.secondToken.velocityTags.push({ name: inputValue, active: false });
        }
        else {
          if(index==='firstToken') this.tokenTags.three.firstToken.velocityTags.push({ name: inputValue, active: false });
          else if(index==='secondToken') this.tokenTags.three.secondToken.velocityTags.push({ name: inputValue, active: false });
          else this.tokenTags.three.thirdToken.velocityTags.push({ name: inputValue, active: false });
        }
      }
      this.velInputVisible = false;
      this.velInputValue = '';
    },
    handleDTInputConfirm(val,index){
      let inputValue = this.dtInputValue;
      if (inputValue) {
        if(val==="one")
        this.tokenTags.one.distributionsTargetsTags.push({ name: inputValue, active: false });
        if(val==="two") {
          if(index==='firstToken') this.tokenTags.two.firstToken.distributionsTargetsTags.push({ name: inputValue, active: false });
          else this.tokenTags.two.secondToken.distributionsTargetsTags.push({ name: inputValue, active: false });
        }
        else {
          if(index==='firstToken') this.tokenTags.three.firstToken.distributionsTargetsTags.push({ name: inputValue, active: false });
          if(index==='secondToken') this.tokenTags.three.secondToken.distributionsTargetsTags.push({ name: inputValue, active: false });
          else this.tokenTags.three.thirdToken.distributionsTargetsTags.push({ name: inputValue, active: false });
        }
      }
      this.dtInputVisible = false;
      this.dtInputValue = '';
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            console.log("yes");
        } 
        else return false;
      })
    },
    removeDomain(index) {
      if (index !== -1) {
        this.dynamicValidateForm.stakeholders.splice(index, 1);
      }
    },
    addDomain() {
      this.dynamicValidateForm.stakeholders.push({
        stakeholder: "",
        allocation: "",
        vesting_policy: {
          type: "percentage",
          datapoints: new Array(),
        },
        key: Date.now()
      });
    },
    openVisualSetting(index){
      // 每次打开可视化面板的时候 传一份 indexDB 里的历史测算数据
      // this.showHistoryDataOfIndexDB();
      // // 每次打开可视化面板的时候 传一份 indexDB 里的 Property 检查结果
      // await this.showMarkerOfIndexDB();
      this.visualSettingVisible = true;
      this.selectedPolicyIndex = index;
    },
  },

  computed: {
  },

  mounted(){
    // this.retrieveAPIkey();
    // let tmpBasicInfo = {
    //   "symbol": "DEX",
    //   "initial_supply": 1000000000,
    //   "inflation": {
    //     "base_rate": 0.05,
    //     "min_rate": 0.02,
    //     "max_rate": 0.1
    //   }
    // };
    // let tmpLineChartData = [
    //   {
    //     "target": "team",
    //     "cliff": 365,
    //     "frequency": 90,
    //     "percentage": ["25%", "25%", "25%", "20%"]
    //   },
    //   {
    //     "target": "advisor",
    //     "cliff": 1825,
    //     "frequency": 365,
    //     "percentage": ["100%"]
    //   },
    //   {
    //     "target": "foundation",
    //     "cliff": 0,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "25%"]
    //   },
    //   {
    //     "target": "investor",
    //     "cliff": 0,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "25%"]
    //   },
    //   {
    //     "target": "airdrop",
    //     "cliff": 0,
    //     "frequency": 0,
    //     "percentage": ["100%"]
    //   },
    //   {
    //     "target": "liquidity_mining",
    //     "cliff": 30,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "20%"]
    //   }
    // ];
    // let tmpPieChartData = {
    //   "team": "15%",
    //   "advisor": "5%",
    //   "foundation": "15%",
    //   "investor": "25%",
    //   "airdrop": "10%",
    //   "liquidity_mining": "30%"
    // };
    // this.packDataForVisualization(tmpBasicInfo,tmpPieChartData, tmpLineChartData);
    // this.msglist.push(
    //   {
    //     content: 'My design for ' + tmpBasicInfo.symbol + ' is as follows: ',
    //     user: false,
    //     drawChart: true,
    //     piedata: JSON.parse(JSON.stringify(this.PieChartData)),
    //     linedata: JSON.parse(JSON.stringify(this.LineChartData)),
    //   }
    // );
    // this.msglist.push(
    //   {
    //     // id: 1,
    //     content: "good",
    //     user: true,
    //     drawChart: false,
    //     piedata: null,
    //     linedata: null,
    //   }
    // );
    // this.msglist.push(
    //   {
    //     // id: 1,
    //     content: "thank you",
    //     user: false,
    //     drawChart: false,
    //     piedata: null,
    //     linedata: null,
    //   }
    // );
  }
}
</script>

<style scoped lang="scss">
.tag-selection {
  width: 500px;
  margin-left: 0px;
  height: auto;
}
.select-title {
  text-align: left;
  margin-bottom: 0px;
}
.select-type {
  width: 500px;
  height: auto;
  overflow: visible;
  float: left;
  text-align: left;
  .type {
    background-color: #ECF5FF;
    color: #409EFF;
  }
  .typeSelect {
    background-color: #70b4f8;
    color: white;
  }
  .tag-title {
    margin: 10px 0px;
    color: #409EFF;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    // vertical-align: bottom;
  }
  /deep/ .el-button {
    border: 0px;
    background: #ECF5FF;
    color: #409EFF;
  }
}
.select-token-kind {
  width: 500px;
  height: auto;
  overflow: visible;
  float: left;
  text-align: left;
  .tokenKind {
    background-color: #D7F3CE;
    color: #67C23A;
  }
  .tokenKindSelect {
    background-color: #67C23A;
    color: #fff;
  }
  .tag-title {
    margin: 10px 0px;
    color: #67C23A;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    // vertical-align: bottom;
  }
  /deep/ .el-button {
    border: 0px;
    background: #D7F3CE;
    color: #67C23A;
  }
}
.token-tag{
  width: 500px;
  height: auto;
  overflow: visible;
  margin:0 auto;
  float: left;
  /deep/ .el-tabs--card>.el-tabs__header .el-tabs__item {
    border-left: none;
  }
  /deep/ .el-tabs--card>.el-tabs__header .el-tabs__nav {
    border: none;
  }
  /deep/ .el-tabs__item{
    background: -webkit-linear-gradient(left, #49b9f5, #f549bf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 500;
  }
  /deep/ .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
    border-bottom-color: #b049f5;
  }
}
.general {
  width: 500px;
  height: 100px;
  overflow: scroll;
}
.select-goal {
  overflow: visible;
  float: left;
  text-align: left;
  height: auto;
  .goal {
    background-color: #ECF5FF;
    color: #4777a7;
  }
  .goalSelect {
    background-color: #4777a7;
    color: white;
  }
  .tag-title {
    margin: 0px 0px;
    color: #4777a7;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
  /deep/ .el-button {
    border: 0px;
    background: #ECF5FF;
    color: #4777a7;
  }
}
.select-capabilities {
  overflow: visible;
  float: left;
  text-align: left;
  height: auto;
  .capabilities {
    background-color: #fef7eb;
    color: #b69357;
  }
  .capabilitiesSelect {
    background-color: #b69357;
    color: white;
  }
  .tag-title {
    margin: 0px 0px;
    color: #b69357;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
  /deep/ .el-button {
    border: 0px;
    background: #fef7eb;
    color: #b69357;
  }
}
.select-velocity {
  overflow: visible;
  float: left;
  text-align: left;
  height: auto;
  .velocity {
    background-color: #f2f9db;
    color: #a1b84d;
  }
  .velocitySelect {
    background-color: #a1b84d;
    color: white;
  }
  .tag-title {
    margin: 0px 0px;
    color: #a1b84d;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
  /deep/ .el-button {
    border: 0px;
    background: #f2f9db;
    color: #a1b84d;
  }
}
.select-distributions-targets {
  overflow: visible;
  float: left;
  text-align: left;
  height: auto;
  .distributionsTargets {
    background-color: #fad9e8;
    color: #a84774;
  }
  .distributionsTargetsSelect {
    background-color: #a84774;
    color: white;
  }
  .tag-title {
    margin: 0px 0px;
    color: #a84774;
  }
  .el-tag+.el-tag {
    margin: 10px 10px;
  }
  /deep/ .el-tag {
    border: 0px;
    margin: 10px 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
  /deep/ .el-button {
    border: 0px;
    background: #fad9e8;
    color: #a84774;
  }
}
.btn {
  margin: 10px auto;
  width: 480px;
  font-weight: 600;
  color: white;
  border: 0;
  background: -webkit-linear-gradient(left, #98d6f5, #d595fa);
}
.loading {
  margin: 20px auto;
  width: 480px;
}
.btn:hover {
  color: #fff;
}
.communication {
  height: auto;
  overflow: visible;
  float: left;
  .ai-answer {
    width: 450px;
    height: auto;
    margin: 15px auto;
  }
  .user-msg {
    width: 450px;
    height: auto;
    margin: 15px auto;
  }
}
.input {
  margin: 10px auto;
  width: 480px;
  height: auto;
  bottom: 0;
  float: left;
}
</style>
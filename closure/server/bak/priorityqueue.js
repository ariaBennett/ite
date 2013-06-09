// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Priority Queue.
 *
 *
 * This file provides the implementation of a Priority Queue. Smaller priorities
 * move to the front of the queue. If two values have the same priority,
 * it is arbitrary which value will come to the front of the queue first.
 */

// TODO(user): Should this rely on natural ordering via some Comparable
//     interface?

goog.provide('ite.start');
goog.require('goog.structs.PriorityQueue');

goog.require('goog.structs.Heap');


ite.start = function() {

};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('ite.start', ite.start);
